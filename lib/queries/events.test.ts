import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

vi.mock("next/cache", () => ({
  unstable_cache: (fn: Function) => fn,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { getEvents, getEventBySlug, getNeighbourEvents } from "@/lib/queries/events"

beforeEach(() => {
  vi.clearAllMocks()
})

const mockEvents = [
  {
    id: "1",
    titleFr: "Event 1",
    titleEn: null,
    slug: "event-1",
    location: "Abbaye",
    city: "Caen",
    department: "CALVADOS",
    category: "ILLUMINATIONS",
    dateStart: new Date("2026-05-29"),
    timeStart: "20:00",
    timeEnd: "23:00",
    coverImage: null,
    accessible: true,
    latitude: null,
    longitude: null,
  },
  {
    id: "2",
    titleFr: "Event 2",
    titleEn: null,
    slug: "event-2",
    location: "Château",
    city: "Rouen",
    department: "SEINE_MARITIME",
    category: "VISITES",
    dateStart: new Date("2026-05-30"),
    timeStart: "21:00",
    timeEnd: null,
    coverImage: "/img.jpg",
    accessible: false,
    latitude: null,
    longitude: null,
  },
]

describe("getEvents", () => {
  it("returns paginated events with total count", async () => {
    prismaMock.event.findMany.mockResolvedValue(mockEvents)
    prismaMock.event.count.mockResolvedValue(16)

    const result = await getEvents({}, "fr")

    expect(result.total).toBe(16)
    expect(result.page).toBe(1)
    expect(result.totalPages).toBe(2)
  })

  it("applies pagination offset", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents({ page: 3 }, "fr")

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 24,
        take: 12,
      })
    )
  })

  it("orders with a unique tie-breaker so OFFSET pages never overlap", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents({ page: 2 }, "fr")

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: [{ dateStart: "asc" }, { id: "asc" }] })
    )
  })

  it("filters by category", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents({ category: "ILLUMINATIONS" as never }, "fr")

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          published: true,
          category: "ILLUMINATIONS",
        }),
      })
    )
  })

  it("filters by department", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents({ department: "CALVADOS" as never }, "fr")

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          published: true,
          department: "CALVADOS",
        }),
      })
    )
  })

  it("filters by theme slug", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents({ theme: "millennium" }, "fr")

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          themes: {
            some: {
              slug: "millennium",
              OR: [{ years: { isEmpty: true } }, { years: { has: 2027 } }],
            },
          },
        }),
      })
    )
  })

  it("filters by accessibility", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents({ accessible: true }, "fr")

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          published: true,
          accessible: true,
        }),
      })
    )
  })

  type DayClause = {
    dateStart: { lte: Date }
    OR: Array<{ dateEnd?: { gte: Date } | null; dateStart?: { gte: Date } }>
  }

  // Evaluates the night clause the way Postgres would, for one event.
  const matchesNights = (
    where: { AND?: Array<{ OR?: DayClause[] }> },
    event: { dateStart: Date; dateEnd: Date | null }
  ) => {
    const clause = where.AND?.find((c) => c.OR?.[0]?.dateStart?.lte)
    if (!clause?.OR) return true
    return clause.OR.some(
      (day) =>
        event.dateStart <= day.dateStart.lte &&
        day.OR.some((alt) =>
          alt.dateEnd === null
            ? event.dateEnd === null && event.dateStart >= alt.dateStart!.gte
            : event.dateEnd !== null && event.dateEnd >= alt.dateEnd!.gte
        )
    )
  }

  const whereFor = async (dates: string[]) => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)
    await getEvents({ dates }, "fr")
    return prismaMock.event.findMany.mock.calls.at(-1)![0].where
  }

  const oneNight = (day: string) => ({ dateStart: new Date(`${day}T20:00:00`), dateEnd: null })

  it("ignores a day that is not a night of the current edition", async () => {
    const where = await whereFor(["29"])
    expect(matchesNights(where, oneNight("2027-05-29"))).toBe(true)
    expect(where.AND).toBeUndefined()
  })

  it.each(["21", "22", "23"])("filter night %s keeps only that night", async (code) => {
    // Default edition (no saved row): 2027, nights 21–23 May.
    const where = await whereFor([code])
    expect(matchesNights(where, oneNight(`2027-05-${code}`))).toBe(true)
    const other = code === "21" ? "22" : "21"
    expect(matchesNights(where, oneNight(`2027-05-${other}`))).toBe(false)
  })

  it("keeps multi-day events on every night they span", async () => {
    const multiDay = {
      dateStart: new Date("2027-05-21T20:00:00"),
      dateEnd: new Date("2027-05-23T22:00:00"),
    }
    for (const code of ["21", "22", "23"]) {
      expect(matchesNights(await whereFor([code]), multiDay)).toBe(true)
    }
  })

  it("matches events on any of several selected nights", async () => {
    const where = await whereFor(["21", "23"])
    expect(matchesNights(where, oneNight("2027-05-21"))).toBe(true)
    expect(matchesNights(where, oneNight("2027-05-23"))).toBe(true)
    expect(matchesNights(where, oneNight("2027-05-22"))).toBe(false)
  })

  it("combines the night filter with a text search", async () => {
    prismaMock.$queryRawUnsafe.mockResolvedValue([{ id: "match-1" }])
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)
    await getEvents({ dates: ["21"], search: "château" }, "fr")
    const where = prismaMock.event.findMany.mock.calls.at(-1)![0].where
    expect(where.AND).toHaveLength(2)
  })

  it("selects dateEnd so cards can render the full range", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents({}, "fr")

    const select = prismaMock.event.findMany.mock.calls[0][0].select
    expect(select.dateEnd).toBe(true)
  })

  describe("proximity fallback", () => {
    // Caen ~ 49.18, -0.37 ; Paris ~ 48.86, 2.35 ; both > 50km from each other
    const caenEvent = {
      id: "caen",
      titleFr: "Caen",
      titleEn: null,
      slug: "caen",
      location: "Caen",
      city: "Caen",
      department: "CALVADOS",
      category: "ILLUMINATIONS",
      dateStart: new Date("2026-05-29"),
      dateEnd: null,
      timeStart: null,
      timeEnd: null,
      coverImage: null,
      accessible: false,
      latitude: 49.18,
      longitude: -0.37,
    }

    it("flags outsideRadius=true when the closest event is beyond 50 km", async () => {
      prismaMock.event.findMany.mockResolvedValue([caenEvent])
      prismaMock.event.count.mockResolvedValue(1)

      // User in Paris, ~230 km from Caen
      const result = await getEvents({ lat: 48.86, lng: 2.35 }, "fr")

      expect(result.outsideRadius).toBe(true)
      expect(result.nearestDistanceKm).toBeGreaterThan(150)
      expect(result.events.length).toBe(1) // events still returned, just sorted by distance
    })

    it("flags outsideRadius=false when the closest event is within 50 km", async () => {
      prismaMock.event.findMany.mockResolvedValue([caenEvent])
      prismaMock.event.count.mockResolvedValue(1)

      // User just outside Caen, ~5 km away
      const result = await getEvents({ lat: 49.22, lng: -0.42 }, "fr")

      expect(result.outsideRadius).toBe(false)
      expect(result.nearestDistanceKm).toBeLessThan(50)
    })

    it("does not flag outsideRadius when user has not opted into geolocation", async () => {
      prismaMock.event.findMany.mockResolvedValue([caenEvent])
      prismaMock.event.count.mockResolvedValue(1)

      const result = await getEvents({}, "fr")

      expect(result.outsideRadius).toBe(false)
      expect(result.nearestDistanceKm).toBeNull()
    })
  })

  it("applies search filter via unaccent raw query", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)
    prismaMock.$queryRawUnsafe.mockResolvedValue([{ id: "match-1" }])

    await getEvents({ search: "Caen" }, "fr")

    expect(prismaMock.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("unaccent"),
      "%Caen%"
    )
    const call = prismaMock.event.findMany.mock.calls[0][0]
    expect(call.where.AND).toBeDefined()
    const idFilter = call.where.AND.find((c: Record<string, unknown>) => c.id)
    expect(idFilter.id.in).toEqual(["match-1"])
  })

  it("returns empty result with zero totalPages", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    const result = await getEvents({}, "fr")

    expect(result.events).toEqual([])
    expect(result.total).toBe(0)
    expect(result.totalPages).toBe(0)
  })

  it("combines multiple filters", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents(
      {
        category: "VISITES" as never,
        department: "ORNE" as never,
        accessible: true,
        search: "Alençon",
      },
      "fr"
    )

    const call = prismaMock.event.findMany.mock.calls[0][0]
    expect(call.where.category).toBe("VISITES")
    expect(call.where.department).toBe("ORNE")
    expect(call.where.accessible).toBe(true)
    expect(call.where.AND).toBeDefined()
  })
})

const mockEventDetail = {
  id: "1",
  titleFr: "Illumination de l'Abbaye",
  titleEn: null,
  slug: "illumination-abbaye",
  descriptionFr: "Découvrez l'Abbaye en lumière.",
  descriptionEn: null,
  location: "Abbaye aux Hommes",
  city: "Caen",
  postalCode: "14000",
  department: "CALVADOS",
  category: "ILLUMINATIONS",
  dateStart: new Date("2026-05-29T20:00:00"),
  dateEnd: new Date("2026-05-31T23:59:00"),
  timeStart: "20:00",
  timeEnd: "00:00",
  pricingFr: "Gratuit",
  pricingEn: null,
  organizer: "Ville de Caen",
  email: "patrimoine@caen.fr",
  phone: null,
  website: null,
  latitude: 49.1811,
  longitude: -0.3726,
  coverImage: "/images/abbaye.jpg",
  images: [],
  featured: true,
  accessible: true,
  published: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  themes: [{ slug: "millennium", nameFr: "Millénaire", nameEn: "Millennium", color: "#d97706" }],
}

describe("getEventBySlug", () => {
  it("returns event by slug with published filter", async () => {
    prismaMock.event.findFirst.mockResolvedValue(mockEventDetail)

    const result = await getEventBySlug("illumination-abbaye", "fr")

    expect(result?.themes).toEqual([{ slug: "millennium", name: "Millénaire", color: "#d97706" }])
    expect(prismaMock.event.findFirst).toHaveBeenCalledWith({
      where: { published: true, slug: "illumination-abbaye" },
      include: {
        photos: {
          orderBy: { order: "asc" },
          select: { url: true, credit: true, title: true, order: true },
        },
        themes: {
          where: { OR: [{ years: { isEmpty: true } }, { years: { has: 2027 } }] },
          orderBy: [{ order: "asc" }, { nameFr: "asc" }],
          select: { slug: true, nameFr: true, nameEn: true, color: true },
        },
        associations: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: { id: true, name: true, url: true, logo: true },
        },
      },
      omit: { socialLinksCheckedAt: true },
    })
  })

  it("returns null for non-existent slug", async () => {
    prismaMock.event.findFirst.mockResolvedValue(null)

    const result = await getEventBySlug("non-existent", "fr")

    expect(result).toBeNull()
  })

  it("returns null for unpublished event", async () => {
    prismaMock.event.findFirst.mockResolvedValue(null)

    const result = await getEventBySlug("unpublished-event", "fr")

    expect(result).toBeNull()
    expect(prismaMock.event.findFirst).toHaveBeenCalledWith({
      where: { published: true, slug: "unpublished-event" },
      include: {
        photos: {
          orderBy: { order: "asc" },
          select: { url: true, credit: true, title: true, order: true },
        },
        themes: {
          where: { OR: [{ years: { isEmpty: true } }, { years: { has: 2027 } }] },
          orderBy: [{ order: "asc" }, { nameFr: "asc" }],
          select: { slug: true, nameFr: true, nameEn: true, color: true },
        },
        associations: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          select: { id: true, name: true, url: true, logo: true },
        },
      },
      omit: { socialLinksCheckedAt: true },
    })
  })
})

describe("getNeighbourEvents", () => {
  const caenLat = 49.18
  const caenLng = -0.37

  const makeEvent = (slug: string, lat: number, lng: number, city = "Ville") => ({
    slug,
    titleFr: `Title ${slug}`,
    titleEn: null,
    latitude: lat,
    longitude: lng,
    city,
    category: "ILLUMINATIONS",
    dateStart: new Date("2027-05-22T20:00:00"),
    dateEnd: null,
  })

  it("returns the dates so the page can suggest same-day neighbours", async () => {
    prismaMock.event.findMany.mockResolvedValue([makeEvent("close", 49.2, -0.4)])

    const [neighbour] = await getNeighbourEvents("current", caenLat, caenLng, "fr")

    expect(neighbour.dateStart).toBe(new Date("2027-05-22T20:00:00").toISOString())
    expect(neighbour.dateEnd).toBeNull()
  })

  it("excludes the current event from neighbours and sorts by distance", async () => {
    prismaMock.event.findMany.mockResolvedValue([
      makeEvent("far", 49.9, 1.1), // Dieppe area, ~140km from Caen
      makeEvent("close", 49.2, -0.4), // 5km from Caen
      makeEvent("medium", 49.5, 0.1), // ~50km from Caen
    ])

    const result = await getNeighbourEvents("current", caenLat, caenLng, "fr")

    expect(result.map((n) => n.slug)).toEqual(["close", "medium", "far"])
    expect(result[0].distanceKm).toBeLessThan(result[1].distanceKm)
    // The DB query must exclude the current slug
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          published: true,
          slug: { not: "current" },
        }),
      })
    )
  })

  it("returns all events by default (no cap)", async () => {
    const many = Array.from({ length: 15 }, (_, i) =>
      makeEvent(`e${i}`, caenLat + i * 0.01, caenLng + i * 0.01)
    )
    prismaMock.event.findMany.mockResolvedValue(many)

    const result = await getNeighbourEvents("current", caenLat, caenLng, "fr")

    expect(result.length).toBe(15)
  })

  it("caps results when an explicit limit is provided", async () => {
    const many = Array.from({ length: 15 }, (_, i) =>
      makeEvent(`e${i}`, caenLat + i * 0.01, caenLng + i * 0.01)
    )
    prismaMock.event.findMany.mockResolvedValue(many)

    const result = await getNeighbourEvents("current", caenLat, caenLng, "fr", 5)

    expect(result.length).toBe(5)
  })

  it("filters out events with null coordinates", async () => {
    prismaMock.event.findMany.mockResolvedValue([
      { ...makeEvent("ok", 49.2, -0.4) },
      { ...makeEvent("nocoord", 49.2, -0.4), latitude: null, longitude: null },
    ])

    const result = await getNeighbourEvents("current", caenLat, caenLng, "fr")

    expect(result.map((n) => n.slug)).toEqual(["ok"])
  })

  it("filters out events with coordinates outside Normandy", async () => {
    prismaMock.event.findMany.mockResolvedValue([
      { ...makeEvent("ok", 49.2, -0.4) },
      { ...makeEvent("canada", 45.8965683, -74.153834) },
      { ...makeEvent("burgundy", 46.485445, 4.13739) },
    ])

    const result = await getNeighbourEvents("current", caenLat, caenLng, "fr")

    expect(result.map((n) => n.slug)).toEqual(["ok"])
    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          latitude: expect.objectContaining({ gte: 48, lte: 50.3 }),
          longitude: expect.objectContaining({ gte: -2.2, lte: 2 }),
        }),
      })
    )
  })
})
