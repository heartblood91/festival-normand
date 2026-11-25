import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

const { connection } = vi.hoisted(() => ({ connection: vi.fn(async () => undefined) }))

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))
vi.mock("next/server", () => ({ connection }))
vi.mock("@/lib/cache", () => ({ cachedQuery: (fn: unknown) => fn }))
vi.mock("@/lib/queries/edition", () => ({ getCurrentEdition: async () => ({ year: 2027 }) }))

import sitemap from "./sitemap"

describe("sitemap", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.theme.findMany.mockResolvedValue([])
  })

  it("renders per request instead of querying the database at build time", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.news.findMany.mockResolvedValue([])
    prismaMock.page.findMany.mockResolvedValue([])

    await sitemap()

    expect(connection).toHaveBeenCalled()
  })

  it("returns static pages", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.news.findMany.mockResolvedValue([])
    prismaMock.page.findMany.mockResolvedValue([])

    const result = await sitemap()

    const urls = result.map((entry) => entry.url)
    expect(urls).toContain("https://pierresenlumieres.fr/fr")
    expect(urls).toContain("https://pierresenlumieres.fr/en")
    expect(urls).toContain("https://pierresenlumieres.fr/fr/evenements")
    expect(urls).toContain("https://pierresenlumieres.fr/en/evenements")
    expect(urls).toContain("https://pierresenlumieres.fr/fr/actualites")
    expect(urls).toContain("https://pierresenlumieres.fr/en/actualites")
    expect(urls).toContain("https://pierresenlumieres.fr/fr/contact")
    expect(urls).toContain("https://pierresenlumieres.fr/en/contact")
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
    expect(urls).toContain("https://pierresenlumieres.fr/fr/evenement/abbaye-jumieges")
    expect(urls).toContain("https://pierresenlumieres.fr/en/evenement/abbaye-jumieges")
    expect(urls).toContain("https://pierresenlumieres.fr/fr/evenement/chateau-caen")
    expect(urls).toContain("https://pierresenlumieres.fr/en/evenement/chateau-caen")
  })

  it("includes published news articles", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.news.findMany.mockResolvedValue([
      { slug: "programme-2026", updatedAt: new Date("2026-03-10") },
    ])
    prismaMock.page.findMany.mockResolvedValue([])

    const result = await sitemap()

    const urls = result.map((entry) => entry.url)
    expect(urls).toContain("https://pierresenlumieres.fr/fr/actualite/programme-2026")
    expect(urls).toContain("https://pierresenlumieres.fr/en/actualite/programme-2026")
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
    expect(urls).toContain("https://pierresenlumieres.fr/fr/festival")
    expect(urls).toContain("https://pierresenlumieres.fr/en/festival")
    expect(urls).toContain("https://pierresenlumieres.fr/fr/inscription")
    expect(urls).toContain("https://pierresenlumieres.fr/en/inscription")
    expect(urls).toContain("https://pierresenlumieres.fr/fr/mentions-legales")
    expect(urls).toContain("https://pierresenlumieres.fr/en/mentions-legales")
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
    prismaMock.event.findMany.mockResolvedValue([{ slug: "test-event", updatedAt: new Date() }])
    prismaMock.news.findMany.mockResolvedValue([{ slug: "test-news", updatedAt: new Date() }])
    prismaMock.page.findMany.mockResolvedValue([])

    const result = await sitemap()

    const homepage = result.find((e) => e.url === "https://pierresenlumieres.fr/fr")
    expect(homepage?.priority).toBe(1)

    const eventsPage = result.find((e) => e.url === "https://pierresenlumieres.fr/fr/evenements")
    expect(eventsPage?.priority).toBe(0.9)

    const eventDetail = result.find((e) => e.url?.includes("/fr/evenement/test-event"))
    expect(eventDetail?.priority).toBe(0.7)

    const newsDetail = result.find((e) => e.url?.includes("/fr/actualite/test-news"))
    expect(newsDetail?.priority).toBe(0.6)
  })

  it("lists the photo gallery only for years with published photos", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.news.findMany.mockResolvedValue([])
    prismaMock.page.findMany.mockResolvedValue([])
    prismaMock.galleryPhoto.groupBy.mockResolvedValueOnce([{ year: 2026 }, { year: 2025 }])

    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls).toContain("https://pierresenlumieres.fr/fr/retour-en-images")
    expect(urls).toContain("https://pierresenlumieres.fr/en/retour-en-images/2025")
    expect(urls).not.toContain("https://pierresenlumieres.fr/fr/retour-en-images/2026")
    expect(prismaMock.galleryPhoto.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ where: { altFr: { not: "" } } })
    )
  })

  it("leaves the gallery out while it is empty", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.news.findMany.mockResolvedValue([])
    prismaMock.page.findMany.mockResolvedValue([])

    const urls = (await sitemap()).map((entry) => entry.url)

    expect(urls.some((url) => url.includes("retour-en-images"))).toBe(false)
  })

  it("lists the pages of the themes shown this edition", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.news.findMany.mockResolvedValue([])
    prismaMock.page.findMany.mockResolvedValue([])
    prismaMock.theme.findMany.mockResolvedValue([
      { slug: "millennium", updatedAt: "2026-11-20T00:00:00.000Z" },
    ])

    const result = await sitemap()
    const entry = result.find(
      (e) => e.url === "https://pierresenlumieres.fr/en/thematique/millennium"
    )

    expect(entry?.lastModified).toEqual(new Date("2026-11-20"))
    expect(entry?.alternates?.languages).toMatchObject({
      fr: "https://pierresenlumieres.fr/fr/thematique/millennium",
    })
    expect(prismaMock.theme.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ years: { isEmpty: true } }, { years: { has: 2027 } }] },
      })
    )
  })

  it("links each URL to its translations and an x-default", async () => {
    prismaMock.event.findMany.mockResolvedValue([])
    prismaMock.news.findMany.mockResolvedValue([])
    prismaMock.page.findMany.mockResolvedValue([])

    const entry = (await sitemap()).find(
      (e) => e.url === "https://pierresenlumieres.fr/en/evenements"
    )

    expect(entry?.alternates?.languages).toEqual({
      fr: "https://pierresenlumieres.fr/fr/evenements",
      en: "https://pierresenlumieres.fr/en/evenements",
      "x-default": "https://pierresenlumieres.fr/fr/evenements",
    })
  })

  it("dates listing pages by their newest item, even from cached string dates", async () => {
    prismaMock.event.findMany.mockResolvedValue([
      { slug: "abbaye-jumieges", updatedAt: "2026-03-12T00:00:00.000Z" },
    ])
    prismaMock.news.findMany.mockResolvedValue([
      { slug: "programme-2026", updatedAt: "2026-03-10T00:00:00.000Z" },
    ])
    prismaMock.page.findMany.mockResolvedValue([])

    const result = await sitemap()
    const byUrl = (url: string) => result.find((e) => e.url === url)?.lastModified

    expect(byUrl("https://pierresenlumieres.fr/fr")).toEqual(new Date("2026-03-12"))
    expect(byUrl("https://pierresenlumieres.fr/fr/actualites")).toEqual(new Date("2026-03-10"))
    expect(byUrl("https://pierresenlumieres.fr/fr/contact")).toBeUndefined()
  })
})
