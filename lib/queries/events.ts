import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { localizeEntity } from "@/lib/i18n/db"
import { searchEventIds } from "@/lib/search"
import { isInNormandyBounds, normandyBoundsWhere } from "@/lib/geo/normandy"
import type { Locale } from "@/lib/i18n/config"
import type { Department, Category, Prisma } from "@prisma/client"

const ITEMS_PER_PAGE = 12

/** Within this distance from the user, "Près de moi" is a strict filter. */
export const NEARBY_RADIUS_KM = 50

const FESTIVAL_DATES: Record<string, string> = {
  "29": "2026-05-29",
  "30": "2026-05-30",
  "31": "2026-05-31",
}

export type EventFilters = {
  search?: string
  date?: string
  category?: Category
  department?: Department
  accessible?: boolean
  page?: number
  lat?: number
  lng?: number
}

const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const EVENT_LIST_SELECT = {
  id: true,
  titleFr: true,
  titleEn: true,
  slug: true,
  location: true,
  city: true,
  department: true,
  category: true,
  dateStart: true,
  dateEnd: true,
  timeStart: true,
  timeEnd: true,
  coverImage: true,
  accessible: true,
  latitude: true,
  longitude: true,
} as const

const buildFilterWhere = async (
  filters: EventFilters,
  overrides?: { key: string; value: string }
): Promise<Prisma.EventWhereInput> => {
  const { search, date, accessible } = filters
  const where: Prisma.EventWhereInput = { published: true }

  const dept =
    overrides?.key === "dept"
      ? overrides.value
      : overrides?.key !== "dept"
        ? filters.department
        : undefined
  const cat =
    overrides?.key === "category"
      ? overrides.value
      : overrides?.key !== "category"
        ? filters.category
        : undefined

  if (cat) where.category = cat as Category
  if (dept) where.department = dept as Department
  if (accessible) where.accessible = true

  if (date) {
    const dateStr = FESTIVAL_DATES[date]
    if (dateStr) {
      const dayStart = new Date(`${dateStr}T00:00:00`)
      const dayEnd = new Date(`${dateStr}T23:59:59`)
      where.dateStart = { lte: dayEnd }
      where.OR = [{ dateEnd: { gte: dayStart } }, { dateEnd: null, dateStart: { gte: dayStart } }]
    }
  }

  if (search) {
    const matchedIds = await searchEventIds(search)
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      { id: { in: matchedIds } },
    ]
  }

  return where
}

export const getEvents = async (filters: EventFilters = {}, locale: Locale = "fr") => {
  const cacheKey = JSON.stringify(filters)

  return cachedQuery(
    async () => {
      const { page = 1, lat, lng } = filters
      const skip = (page - 1) * ITEMS_PER_PAGE
      const where = await buildFilterWhere(filters)
      const isNearby = lat !== undefined && lng !== undefined

      const [rawEvents, total] = await Promise.all([
        prisma.event.findMany({
          where,
          orderBy: isNearby ? undefined : { dateStart: "asc" },
          ...(isNearby ? {} : { skip, take: ITEMS_PER_PAGE }),
          select: EVENT_LIST_SELECT,
        }),
        prisma.event.count({ where }),
      ])

      let nearestDistanceKm: number | null = null
      const events = isNearby
        ? (() => {
            const withDistance = rawEvents
              .map((e) => ({
                ...e,
                distance:
                  e.latitude && e.longitude
                    ? haversineDistance(lat, lng, e.latitude, e.longitude)
                    : Infinity,
              }))
              .sort((a, b) => a.distance - b.distance)
            nearestDistanceKm = withDistance[0]?.distance ?? null
            return withDistance.slice(skip, skip + ITEMS_PER_PAGE)
          })()
        : rawEvents

      const serialized = events.map((e) => ({
        ...localizeEntity(e, locale, ["title"]),
        dateStart: e.dateStart?.toISOString() ?? null,
        dateEnd: e.dateEnd?.toISOString() ?? null,
      }))

      const outsideRadius =
        isNearby &&
        nearestDistanceKm !== null &&
        Number.isFinite(nearestDistanceKm) &&
        nearestDistanceKm > NEARBY_RADIUS_KM

      return {
        events: serialized,
        total,
        page,
        totalPages: Math.ceil(total / ITEMS_PER_PAGE),
        outsideRadius,
        nearestDistanceKm:
          nearestDistanceKm !== null && Number.isFinite(nearestDistanceKm)
            ? Math.round(nearestDistanceKm)
            : null,
      }
    },
    ["events-list", locale, cacheKey],
    { revalidate: 300, tags: ["events"] }
  )()
}

export type EventListItem = Awaited<ReturnType<typeof getEvents>>["events"][number]

/** Other published events with valid coordinates, sorted by distance.
 *  No cap by default — show all so the map paints a regional picture of the
 *  festival. Pass a limit only when you really need a top-N. */
export const getNeighbourEvents = async (
  excludeSlug: string,
  lat: number,
  lng: number,
  locale: Locale = "fr",
  limit?: number
) =>
  cachedQuery(
    async () => {
      const candidates = await prisma.event.findMany({
        where: {
          published: true,
          slug: { not: excludeSlug },
          ...normandyBoundsWhere,
          NOT: [{ latitude: null }, { longitude: null }],
        },
        select: {
          slug: true,
          titleFr: true,
          titleEn: true,
          latitude: true,
          longitude: true,
          city: true,
          category: true,
        },
      })

      const sorted = candidates
        .map((e) => ({
          ...localizeEntity(e, locale, ["title"]),
          distance:
            e.latitude && e.longitude
              ? haversineDistance(lat, lng, e.latitude, e.longitude)
              : Infinity,
        }))
        .filter((e) => Number.isFinite(e.distance))
        .filter((e) => isInNormandyBounds({ latitude: e.latitude, longitude: e.longitude }))
        .sort((a, b) => a.distance - b.distance)

      const capped = typeof limit === "number" ? sorted.slice(0, limit) : sorted

      return capped.map((e) => ({
        slug: e.slug,
        title: e.title,
        latitude: e.latitude as number,
        longitude: e.longitude as number,
        city: e.city,
        category: e.category,
        distanceKm: Math.round(e.distance * 10) / 10,
      }))
    },
    ["event-neighbours", excludeSlug, locale, limit === undefined ? "all" : String(limit)],
    { revalidate: 1800, tags: ["events"] }
  )()

export type NeighbourEvent = Awaited<ReturnType<typeof getNeighbourEvents>>[number]

export const getEventBySlug = async (slug: string, locale: Locale = "fr") =>
  cachedQuery(
    async () => {
      const event = await prisma.event.findUnique({
        where: { slug, published: true },
        include: {
          photos: {
            orderBy: { order: "asc" },
            select: { url: true, credit: true, title: true, order: true },
          },
        },
      })
      if (!event) return null
      return {
        ...localizeEntity(event, locale, ["title", "description", "pricing"]),
        dateStart: event.dateStart?.toISOString() ?? null,
        dateEnd: event.dateEnd?.toISOString() ?? null,
        createdAt: event.createdAt.toISOString(),
        updatedAt: event.updatedAt.toISOString(),
      }
    },
    ["event-detail", slug, locale],
    { revalidate: 1800, tags: ["events"] }
  )()

export type EventDetail = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>

export const getAllFilteredEventsForMap = async (
  filters: EventFilters = {},
  locale: Locale = "fr"
) => {
  const cacheKey = JSON.stringify(filters)

  return cachedQuery(
    async () => {
      const events = await prisma.event.findMany({
        where: {
          ...(await buildFilterWhere(filters)),
          ...normandyBoundsWhere,
        },
        orderBy: { dateStart: "asc" },
        select: {
          id: true,
          titleFr: true,
          titleEn: true,
          slug: true,
          category: true,
          latitude: true,
          longitude: true,
          dateStart: true,
          dateEnd: true,
          timeStart: true,
          city: true,
          coverImage: true,
        },
      })
      return events.map((e) => ({
        ...localizeEntity(e, locale, ["title"]),
        dateStart: e.dateStart?.toISOString() ?? null,
        dateEnd: e.dateEnd?.toISOString() ?? null,
      }))
    },
    ["events-map", locale, cacheKey],
    { revalidate: 300, tags: ["events"] }
  )()
}

export type MapEventItem = Awaited<ReturnType<typeof getAllFilteredEventsForMap>>[number]

export const getFilterCounts = async (filters: EventFilters = {}) => {
  const cacheKey = JSON.stringify(filters)

  return cachedQuery(
    async () => {
      const deptValues = ["CALVADOS", "EURE", "MANCHE", "ORNE", "SEINE_MARITIME"]
      const catValues = ["ILLUMINATIONS", "EXPOSITIONS", "ANIMATIONS", "VISITES"]

      const [deptCounts, catCounts] = await Promise.all([
        Promise.all(
          deptValues.map(async (d) =>
            prisma.event.count({
              where: await buildFilterWhere(filters, { key: "dept", value: d }),
            })
          )
        ),
        Promise.all(
          catValues.map(async (c) =>
            prisma.event.count({
              where: await buildFilterWhere(filters, { key: "category", value: c }),
            })
          )
        ),
      ])

      const departments: Record<string, number> = {}
      const categories: Record<string, number> = {}
      deptValues.forEach((d, i) => {
        departments[d] = deptCounts[i]
      })
      catValues.forEach((c, i) => {
        categories[c] = catCounts[i]
      })

      return { departments, categories }
    },
    ["filter-counts", cacheKey],
    { revalidate: 300, tags: ["events"] }
  )()
}
