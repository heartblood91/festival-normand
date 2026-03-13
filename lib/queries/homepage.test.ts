import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import {
  getFeaturedEvents,
  getLatestNews,
  getPartners,
  getEventCities,
} from "@/lib/queries/homepage"

beforeEach(() => {
  vi.clearAllMocks()
})

describe("getFeaturedEvents", () => {
  it("returns featured published events ordered by dateStart", async () => {
    const mockEvents = [
      { id: "1", title: "Event 1", slug: "event-1", featured: true },
      { id: "2", title: "Event 2", slug: "event-2", featured: true },
    ]
    prismaMock.event.findMany.mockResolvedValue(mockEvents)

    const result = await getFeaturedEvents()

    expect(result).toEqual(mockEvents)
    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: { published: true, featured: true },
      orderBy: { dateStart: "asc" },
      take: 3,
      select: expect.objectContaining({
        id: true,
        title: true,
        slug: true,
        coverImage: true,
      }),
    })
  })

  it("returns empty array when no featured events", async () => {
    prismaMock.event.findMany.mockResolvedValue([])

    const result = await getFeaturedEvents()

    expect(result).toEqual([])
  })
})

describe("getLatestNews", () => {
  it("returns published news ordered by date desc", async () => {
    const mockNews = [
      { id: "1", title: "News 1", slug: "news-1", publishedAt: new Date() },
    ]
    prismaMock.news.findMany.mockResolvedValue(mockNews)

    const result = await getLatestNews()

    expect(result).toEqual(mockNews)
    expect(prismaMock.news.findMany).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: expect.objectContaining({
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
      }),
    })
  })

  it("returns empty array when no news", async () => {
    prismaMock.news.findMany.mockResolvedValue([])

    const result = await getLatestNews()

    expect(result).toEqual([])
  })
})

describe("getPartners", () => {
  it("returns partners ordered by order field", async () => {
    const mockPartners = [
      { id: "1", name: "Partner 1", order: 1 },
      { id: "2", name: "Partner 2", order: 2 },
    ]
    prismaMock.partner.findMany.mockResolvedValue(mockPartners)

    const result = await getPartners()

    expect(result).toEqual(mockPartners)
    expect(prismaMock.partner.findMany).toHaveBeenCalledWith({
      orderBy: { order: "asc" },
      select: expect.objectContaining({
        id: true,
        name: true,
        logo: true,
        website: true,
      }),
    })
  })
})

describe("getEventCities", () => {
  it("returns distinct city names from published events", async () => {
    const mockCities = [
      { city: "Caen" },
      { city: "Rouen" },
      { city: "Bayeux" },
    ]
    prismaMock.event.findMany.mockResolvedValue(mockCities)

    const result = await getEventCities()

    expect(result).toEqual(["Caen", "Rouen", "Bayeux"])
    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: { published: true },
      select: { city: true },
      distinct: ["city"],
      orderBy: { city: "asc" },
    })
  })

  it("returns empty array when no events", async () => {
    prismaMock.event.findMany.mockResolvedValue([])

    const result = await getEventCities()

    expect(result).toEqual([])
  })
})
