import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

vi.mock("next/cache", () => ({
  unstable_cache: (fn: Function) => fn,
}))

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
      { id: "1", titleFr: "Event 1", titleEn: null, slug: "event-1", location: "Caen", city: "Caen", department: "CALVADOS", category: "ILLUMINATIONS", dateStart: new Date("2026-05-29"), timeStart: null, timeEnd: null, coverImage: null },
      { id: "2", titleFr: "Event 2", titleEn: null, slug: "event-2", location: "Rouen", city: "Rouen", department: "SEINE_MARITIME", category: "EXPOSITIONS", dateStart: new Date("2026-05-30"), timeStart: null, timeEnd: null, coverImage: null },
    ]
    prismaMock.event.findMany.mockResolvedValue(mockEvents)

    const result = await getFeaturedEvents("fr")

    expect(result).toHaveLength(2)
    expect(prismaMock.event.findMany).toHaveBeenCalledWith({
      where: { published: true, featured: true },
      orderBy: { dateStart: "asc" },
      take: 3,
      select: expect.objectContaining({
        id: true,
        titleFr: true,
        titleEn: true,
        slug: true,
        coverImage: true,
      }),
    })
  })

  it("returns empty array when no featured events", async () => {
    prismaMock.event.findMany.mockResolvedValue([])

    const result = await getFeaturedEvents("fr")

    expect(result).toEqual([])
  })
})

describe("getLatestNews", () => {
  it("returns published news ordered by date desc", async () => {
    const mockNews = [
      { id: "1", titleFr: "News 1", titleEn: null, slug: "news-1", excerptFr: "Excerpt 1", excerptEn: null, coverImage: null, publishedAt: new Date() },
    ]
    prismaMock.news.findMany.mockResolvedValue(mockNews)

    const result = await getLatestNews("fr")

    expect(result).toHaveLength(1)
    expect(prismaMock.news.findMany).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      take: 6,
      select: expect.objectContaining({
        id: true,
        titleFr: true,
        titleEn: true,
        slug: true,
        excerptFr: true,
        excerptEn: true,
        coverImage: true,
        publishedAt: true,
      }),
    })
  })

  it("returns empty array when no news", async () => {
    prismaMock.news.findMany.mockResolvedValue([])

    const result = await getLatestNews("fr")

    expect(result).toEqual([])
  })
})

describe("getPartners", () => {
  it("returns partners ordered by order field", async () => {
    const mockPartners = [
      { id: "1", nameFr: "Partner 1", nameEn: null, logo: null, website: null },
      { id: "2", nameFr: "Partner 2", nameEn: null, logo: null, website: null },
    ]
    prismaMock.partner.findMany.mockResolvedValue(mockPartners)

    const result = await getPartners("fr")

    expect(result).toHaveLength(2)
    expect(prismaMock.partner.findMany).toHaveBeenCalledWith({
      orderBy: { order: "asc" },
      select: expect.objectContaining({
        id: true,
        nameFr: true,
        nameEn: true,
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
