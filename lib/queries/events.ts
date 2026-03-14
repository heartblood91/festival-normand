import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import type { Department, Category, Prisma } from "@prisma/client"

const ITEMS_PER_PAGE = 12

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
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export const getEvents = async (filters: EventFilters = {}) => {
  const cacheKey = JSON.stringify(filters)

  return unstable_cache(
    async () => {
      const { search, date, category, department, accessible, page = 1, lat, lng } = filters
      const skip = (page - 1) * ITEMS_PER_PAGE

      const where: Prisma.EventWhereInput = {
        published: true,
      }

      if (category) {
        where.category = category
      }

      if (department) {
        where.department = department
      }

      if (accessible) {
        where.accessible = true
      }

      if (date) {
        const dateMap: Record<string, string> = {
          "29": "2026-05-29",
          "30": "2026-05-30",
          "31": "2026-05-31",
        }
        const dateStr = dateMap[date]
        if (dateStr) {
          const dayStart = new Date(`${dateStr}T00:00:00`)
          const dayEnd = new Date(`${dateStr}T23:59:59`)
          where.dateStart = { lte: dayEnd }
          where.OR = [
            { dateEnd: { gte: dayStart } },
            { dateEnd: null, dateStart: { gte: dayStart } },
          ]
        }
      }

      if (search) {
        const searchLower = search.toLowerCase()
        where.AND = [
          ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
          {
            OR: [
              { title: { contains: searchLower, mode: "insensitive" } },
              { city: { contains: searchLower, mode: "insensitive" } },
              { location: { contains: searchLower, mode: "insensitive" } },
            ],
          },
        ]
      }

      const isNearby = lat !== undefined && lng !== undefined

      const [rawEvents, total] = await Promise.all([
        prisma.event.findMany({
          where,
          orderBy: isNearby ? undefined : { dateStart: "asc" },
          ...(isNearby ? {} : { skip, take: ITEMS_PER_PAGE }),
          select: {
            id: true,
            title: true,
            slug: true,
            location: true,
            city: true,
            department: true,
            category: true,
            dateStart: true,
            timeStart: true,
            timeEnd: true,
            coverImage: true,
            accessible: true,
            latitude: true,
            longitude: true,
          },
        }),
        prisma.event.count({ where }),
      ])

      // Sort by distance if geolocation is provided
      const events = isNearby
        ? rawEvents
            .map((e) => ({
              ...e,
              distance: e.latitude && e.longitude
                ? haversineDistance(lat, lng, e.latitude, e.longitude)
                : Infinity,
            }))
            .sort((a, b) => a.distance - b.distance)
            .slice(skip, skip + ITEMS_PER_PAGE)
        : rawEvents

      return {
        events,
        total,
        page,
        totalPages: Math.ceil(total / ITEMS_PER_PAGE),
        itemsPerPage: ITEMS_PER_PAGE,
      }
    },
    ["events-list", cacheKey],
    { revalidate: 300, tags: ["events"] }
  )()
}

export type EventListItem = Awaited<ReturnType<typeof getEvents>>["events"][number]

export const getEventBySlug = async (slug: string) => {
  return unstable_cache(
    async () => {
      return prisma.event.findUnique({
        where: { slug, published: true },
      })
    },
    ["event-detail", slug],
    { revalidate: 1800, tags: ["events"] }
  )()
}

export type EventDetail = NonNullable<Awaited<ReturnType<typeof getEventBySlug>>>

const buildFilterWhere = (filters: EventFilters): Prisma.EventWhereInput => {
  const { search, date, category, department, accessible } = filters
  const where: Prisma.EventWhereInput = {
    published: true,
  }

  if (category) {
    where.category = category
  }

  if (department) {
    where.department = department
  }

  if (accessible) {
    where.accessible = true
  }

  if (date) {
    const dateMap: Record<string, string> = {
      "29": "2026-05-29",
      "30": "2026-05-30",
      "31": "2026-05-31",
    }
    const dateStr = dateMap[date]
    if (dateStr) {
      const dayStart = new Date(`${dateStr}T00:00:00`)
      const dayEnd = new Date(`${dateStr}T23:59:59`)
      where.dateStart = { lte: dayEnd }
      where.OR = [
        { dateEnd: { gte: dayStart } },
        { dateEnd: null, dateStart: { gte: dayStart } },
      ]
    }
  }

  if (search) {
    const searchLower = search.toLowerCase()
    where.AND = [
      ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
      {
        OR: [
          { title: { contains: searchLower, mode: "insensitive" } },
          { city: { contains: searchLower, mode: "insensitive" } },
          { location: { contains: searchLower, mode: "insensitive" } },
        ],
      },
    ]
  }

  return where
}

export const getAllFilteredEventsForMap = async (filters: EventFilters = {}) => {
  const cacheKey = JSON.stringify(filters)

  return unstable_cache(
    async () => {
      const where = buildFilterWhere(filters)

      const events = await prisma.event.findMany({
        where: {
          ...where,
          latitude: { not: 0 },
          longitude: { not: 0 },
        },
        orderBy: { dateStart: "asc" },
        select: {
          id: true,
          title: true,
          slug: true,
          category: true,
          latitude: true,
          longitude: true,
          dateStart: true,
          timeStart: true,
          city: true,
          coverImage: true,
        },
      })

      return events
    },
    ["events-map", cacheKey],
    { revalidate: 300, tags: ["events"] }
  )()
}

export type MapEventItem = Awaited<ReturnType<typeof getAllFilteredEventsForMap>>[number]

export const getFilterCounts = async (filters: EventFilters = {}) => {
  const cacheKey = JSON.stringify(filters)

  return unstable_cache(
    async () => {
      const { search, date, category, department, accessible } = filters

      const buildWhere = (overrideKey?: string, overrideValue?: string) => {
        const where: Prisma.EventWhereInput = {
          published: true,
        }

        // Use override values if provided, otherwise use active filter
        // But ignore the override key's corresponding filter value
        if (overrideKey === "dept" && overrideValue) {
          where.department = overrideValue as Department
        } else if (department && overrideKey !== "dept") {
          where.department = department
        }

        if (overrideKey === "category" && overrideValue) {
          where.category = overrideValue as Category
        } else if (category && overrideKey !== "category") {
          where.category = category
        }

        if (accessible) {
          where.accessible = true
        }

        if (date) {
          const dateMap: Record<string, string> = {
            "29": "2026-05-29",
            "30": "2026-05-30",
            "31": "2026-05-31",
          }
          const dateStr = dateMap[date]
          if (dateStr) {
            const dayStart = new Date(`${dateStr}T00:00:00`)
            const dayEnd = new Date(`${dateStr}T23:59:59`)
            where.dateStart = { lte: dayEnd }
            where.OR = [
              { dateEnd: { gte: dayStart } },
              { dateEnd: null, dateStart: { gte: dayStart } },
            ]
          }
        }

        if (search) {
          const searchLower = search.toLowerCase()
          where.AND = [
            ...(Array.isArray(where.AND) ? where.AND : where.AND ? [where.AND] : []),
            {
              OR: [
                { title: { contains: searchLower, mode: "insensitive" } },
                { city: { contains: searchLower, mode: "insensitive" } },
                { location: { contains: searchLower, mode: "insensitive" } },
              ],
            },
          ]
        }

        return where
      }

      const departments: Record<string, number> = {}
      const categories: Record<string, number> = {}

      const deptValues = ["CALVADOS", "EURE", "MANCHE", "ORNE", "SEINE_MARITIME"]
      const catValues = ["ILLUMINATIONS", "EXPOSITIONS", "ANIMATIONS", "VISITES"]

      const deptCounts = await Promise.all(
        deptValues.map((dept) =>
          prisma.event.count({
            where: buildWhere("dept", dept),
          })
        )
      )

      const catCounts = await Promise.all(
        catValues.map((cat) =>
          prisma.event.count({
            where: buildWhere("category", cat),
          })
        )
      )

      deptValues.forEach((dept, idx) => {
        departments[dept] = deptCounts[idx]
      })

      catValues.forEach((cat, idx) => {
        categories[cat] = catCounts[idx]
      })

      return { departments, categories }
    },
    ["filter-counts", cacheKey],
    { revalidate: 300, tags: ["events"] }
  )()
}
