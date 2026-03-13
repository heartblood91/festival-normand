import { describe, it, expect, vi, beforeEach } from "vitest"
import { prismaMock } from "@/lib/test-utils"

vi.mock("@/lib/prisma", () => ({
  prisma: prismaMock,
}))

import { getNews, getNewsBySlug } from "@/lib/queries/news"

beforeEach(() => {
  vi.clearAllMocks()
})

const mockNewsArticles = [
  {
    id: "1",
    title: "Programme 2026 dévoilé",
    slug: "programme-2026-devoile",
    excerpt: "Découvrez le programme complet",
    coverImage: "/images/news-1.jpg",
    publishedAt: new Date("2026-03-10"),
  },
  {
    id: "2",
    title: "Les bénévoles au cœur du festival",
    slug: "benevoles-coeur-festival",
    excerpt: "Rencontre avec les bénévoles",
    coverImage: null,
    publishedAt: new Date("2026-03-01"),
  },
]

describe("getNews", () => {
  it("returns published news ordered by date desc", async () => {
    prismaMock.news.findMany.mockResolvedValue(mockNewsArticles)

    const result = await getNews()

    expect(result).toEqual(mockNewsArticles)
    expect(prismaMock.news.findMany).toHaveBeenCalledWith({
      where: { published: true },
      orderBy: { publishedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        coverImage: true,
        publishedAt: true,
      },
    })
  })

  it("returns empty array when no news", async () => {
    prismaMock.news.findMany.mockResolvedValue([])

    const result = await getNews()

    expect(result).toEqual([])
  })
})

const mockNewsDetail = {
  id: "1",
  title: "Programme 2026 dévoilé",
  slug: "programme-2026-devoile",
  excerpt: "Découvrez le programme complet",
  content: "# Programme 2026\n\nContenu complet de l'article.",
  coverImage: "/images/news-1.jpg",
  published: true,
  publishedAt: new Date("2026-03-10"),
  createdAt: new Date(),
  updatedAt: new Date(),
}

describe("getNewsBySlug", () => {
  it("returns article by slug with published filter", async () => {
    prismaMock.news.findUnique.mockResolvedValue(mockNewsDetail)

    const result = await getNewsBySlug("programme-2026-devoile")

    expect(result).toEqual(mockNewsDetail)
    expect(prismaMock.news.findUnique).toHaveBeenCalledWith({
      where: { slug: "programme-2026-devoile", published: true },
    })
  })

  it("returns null for non-existent slug", async () => {
    prismaMock.news.findUnique.mockResolvedValue(null)

    const result = await getNewsBySlug("non-existent")

    expect(result).toBeNull()
  })

  it("returns null for unpublished article", async () => {
    prismaMock.news.findUnique.mockResolvedValue(null)

    const result = await getNewsBySlug("draft-article")

    expect(result).toBeNull()
    expect(prismaMock.news.findUnique).toHaveBeenCalledWith({
      where: { slug: "draft-article", published: true },
    })
  })
})
