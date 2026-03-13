import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import sitemap from "./sitemap"

describe("sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns static pages", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.news.findMany.mockResolvedValue([])
    prismaMock.page.findMany.mockResolvedValue([])

    const result = await sitemap()

    const urls = result.map((entry) => entry.url)
    expect(urls).toContain("https://pierresenlumieres.fr")
    expect(urls).toContain("https://pierresenlumieres.fr/evenements")
    expect(urls).toContain("https://pierresenlumieres.fr/actualites")
    expect(urls).toContain("https://pierresenlumieres.fr/contact")
  })

  it("includes published events", async () => {
    prismaMock.event.findMany.mockResolvedValue([
      { slug: "abbaye-jumieges", updatedAt: new Date("2026-03-10") },
      { slug: "chateau-caen", updatedAt: new Date("2026-03-11") },
    ])
    prismaMock.news.findMany.mockResolvedValue([])
    prismaMock.page.findMany.mockResolvedValue([])

    const result = await sitemap()

    const urls = result.map((entry) => entry.url)
    expect(urls).toContain("https://pierresenlumieres.fr/evenement/abbaye-jumieges")
    expect(urls).toContain("https://pierresenlumieres.fr/evenement/chateau-caen")
  })

  it("includes published news articles", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.news.findMany.mockResolvedValue([
      { slug: "programme-2026", updatedAt: new Date("2026-03-10") },
    ])
    prismaMock.page.findMany.mockResolvedValue([])

    const result = await sitemap()

    const urls = result.map((entry) => entry.url)
    expect(urls).toContain("https://pierresenlumieres.fr/actualite/programme-2026")
  })

  it("includes pages from database", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.news.findMany.mockResolvedValue([])
    prismaMock.page.findMany.mockResolvedValue([
      { slug: "festival", updatedAt: new Date("2026-03-01") },
      { slug: "inscription", updatedAt: new Date("2026-03-01") },
      { slug: "mentions-legales", updatedAt: new Date("2026-03-01") },
    ])

    const result = await sitemap()

    const urls = result.map((entry) => entry.url)
    expect(urls).toContain("https://pierresenlumieres.fr/festival")
    expect(urls).toContain("https://pierresenlumieres.fr/inscription")
    expect(urls).toContain("https://pierresenlumieres.fr/mentions-legales")
  })

  it("queries only published events and news", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.news.findMany.mockResolvedValue([])
    prismaMock.page.findMany.mockResolvedValue([])

    await sitemap()

    expect(prismaMock.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { published: true } })
    )
    expect(prismaMock.news.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { published: true } })
    )
  })

  it("sets correct priorities", async () => {
    prismaMock.event.findMany.mockResolvedValue([
      { slug: "test-event", updatedAt: new Date() },
    ])
    prismaMock.news.findMany.mockResolvedValue([
      { slug: "test-news", updatedAt: new Date() },
    ])
    prismaMock.page.findMany.mockResolvedValue([])

    const result = await sitemap()

    const homepage = result.find((e) => e.url === "https://pierresenlumieres.fr")
    expect(homepage?.priority).toBe(1)

    const eventsPage = result.find((e) => e.url === "https://pierresenlumieres.fr/evenements")
    expect(eventsPage?.priority).toBe(0.9)

    const eventDetail = result.find((e) => e.url?.includes("/evenement/test-event"))
    expect(eventDetail?.priority).toBe(0.7)

    const newsDetail = result.find((e) => e.url?.includes("/actualite/test-news"))
    expect(newsDetail?.priority).toBe(0.6)
  })
})
