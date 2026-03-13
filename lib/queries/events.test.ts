import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

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
    title: "Event 1",
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
  },
  {
    id: "2",
    title: "Event 2",
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
  },
]

describe("getEvents", () => {
  it("returns paginated events with total count", async () => {
    prismaMock.event.findMany.mockResolvedValue(mockEvents)
    prismaMock.event.count.mockResolvedValue(16)

    const result = await getEvents()

    expect(result.events).toEqual(mockEvents)
    expect(result.total).toBe(16)
    expect(result.page).toBe(1)
    expect(result.totalPages).toBe(2)
    expect(result.itemsPerPage).toBe(12)
  })

  it("applies pagination offset", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents({ page: 3 })

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

    await getEvents({ category: "ILLUMINATIONS" as never })

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

    await getEvents({ department: "CALVADOS" as never })

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

    await getEvents({ accessible: true })

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

    await getEvents({ date: "29" })

    const call = prismaMock.event.findMany.mock.calls[0][0]
    expect(call.where.dateStart).toBeDefined()
    expect(call.where.OR).toBeDefined()
  })

  it("applies search filter on title, city and location", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    await getEvents({ search: "Caen" })

    const call = prismaMock.event.findMany.mock.calls[0][0]
    expect(call.where.AND).toBeDefined()
    const searchCondition = call.where.AND.find(
      (c: Record<string, unknown>) => c.OR
    )
    expect(searchCondition.OR).toHaveLength(3)
  })

  it("returns empty result with zero totalPages", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.event.count.mockResolvedValue(0)

    const result = await getEvents()

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
    })

    const call = prismaMock.event.findMany.mock.calls[0][0]
    expect(call.where.category).toBe("VISITES")
    expect(call.where.department).toBe("ORNE")
    expect(call.where.accessible).toBe(true)
    expect(call.where.AND).toBeDefined()
  })
})

const mockEventDetail = {
  id: "1",
  title: "Illumination de l'Abbaye",
  slug: "illumination-abbaye",
  description: "Découvrez l'Abbaye en lumière.",
  location: "Abbaye aux Hommes",
  city: "Caen",
  postalCode: "14000",
  department: "CALVADOS",
  category: "ILLUMINATIONS",
  dateStart: new Date("2026-05-29T20:00:00"),
  dateEnd: new Date("2026-05-31T23:59:00"),
  timeStart: "20:00",
  timeEnd: "00:00",
  pricing: "Gratuit",
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

    const result = await getEventBySlug("illumination-abbaye")

    expect(result).toEqual(mockEventDetail)
    expect(prismaMock.event.findUnique).toHaveBeenCalledWith({
      where: { slug: "illumination-abbaye", published: true },
    })
  })

  it("returns null for non-existent slug", async () => {
    prismaMock.event.findUnique.mockResolvedValue(null)

    const result = await getEventBySlug("non-existent")

    expect(result).toBeNull()
  })

  it("returns null for unpublished event", async () => {
    prismaMock.event.findUnique.mockResolvedValue(null)

    const result = await getEventBySlug("unpublished-event")

    expect(result).toBeNull()
    expect(prismaMock.event.findUnique).toHaveBeenCalledWith({
      where: { slug: "unpublished-event", published: true },
    })
  })
})
