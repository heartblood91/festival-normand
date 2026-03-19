import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

vi.mock("next/cache", () => ({
  unstable_cache: (fn: Function) => fn,
}))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { getEvents, getEventBySlug } from "@/lib/queries/events"

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

  it("filters by date", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents({ date: "29" }, "fr")

    const call = prismaMock.event.findMany.mock.calls[0][0]
    expect(call.where.dateStart).toBeDefined()
    expect(call.where.OR).toBeDefined()
  })

  it("applies search filter on title, city and location", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents({ search: "Caen" }, "fr")

    const call = prismaMock.event.findMany.mock.calls[0][0]
    expect(call.where.AND).toBeDefined()
    const searchCondition = call.where.AND.find(
      (c: Record<string, unknown>) => c.OR
    )
    expect(searchCondition.OR).toHaveLength(4)
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

    await getEvents({
      category: "VISITES" as never,
      department: "ORNE" as never,
      accessible: true,
      search: "Alençon",
    }, "fr")

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
}

describe("getEventBySlug", () => {
  it("returns event by slug with published filter", async () => {
    prismaMock.event.findUnique.mockResolvedValue(mockEventDetail)

    const result = await getEventBySlug("illumination-abbaye", "fr")

    expect(result).not.toBeNull()
    expect(prismaMock.event.findUnique).toHaveBeenCalledWith({
      where: { slug: "illumination-abbaye", published: true },
    })
  })

  it("returns null for non-existent slug", async () => {
    prismaMock.event.findUnique.mockResolvedValue(null)

    const result = await getEventBySlug("non-existent", "fr")

    expect(result).toBeNull()
  })

  it("returns null for unpublished event", async () => {
    prismaMock.event.findUnique.mockResolvedValue(null)

    const result = await getEventBySlug("unpublished-event", "fr")

    expect(result).toBeNull()
    expect(prismaMock.event.findUnique).toHaveBeenCalledWith({
      where: { slug: "unpublished-event", published: true },
    })
  })
})
