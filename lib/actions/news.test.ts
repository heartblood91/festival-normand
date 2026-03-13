import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    news: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

import {
  createNews,
  updateNews,
  deleteNews,
  getAdminNews,
  getAdminNewsById,
} from "./news"

const createFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

const validNewsData = {
  title: "Nouvelle édition du festival",
  slug: "nouvelle-edition-du-festival",
  content: "<p>Le festival revient cette année avec de nombreuses nouveautés.</p>",
  excerpt: "Le festival revient cette année",
  coverImage: "",
  published: "true",
  publishedAt: "2026-03-13",
}

describe("createNews", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates news article successfully", async () => {
    mockPrisma.news.findUnique.mockResolvedValue(null)
    mockPrisma.news.create.mockResolvedValue({
      id: "test-id",
      slug: "nouvelle-edition-du-festival",
    })

    const result = await createNews(createFormData(validNewsData))

    expect(result.success).toBe(true)
    expect(result.newsId).toBe("test-id")
    expect(mockPrisma.news.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Nouvelle édition du festival",
          slug: "nouvelle-edition-du-festival",
        }),
      })
    )
  })

  it("returns validation errors for invalid data", async () => {
    const result = await createNews(
      createFormData({ ...validNewsData, title: "ab", content: "short" })
    )

    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
    expect(result.errors?.title).toBeDefined()
    expect(result.errors?.content).toBeDefined()
  })

  it("returns error for duplicate slug", async () => {
    mockPrisma.news.findUnique.mockResolvedValue({ id: "existing-id" })

    const result = await createNews(createFormData(validNewsData))

    expect(result.success).toBe(false)
    expect(result.errors?.slug).toBeDefined()
    expect(mockPrisma.news.create).not.toHaveBeenCalled()
  })

  it("handles database errors gracefully", async () => {
    mockPrisma.news.findUnique.mockResolvedValue(null)
    mockPrisma.news.create.mockRejectedValue(new Error("DB error"))

    const result = await createNews(createFormData(validNewsData))

    expect(result.success).toBe(false)
    expect(result.message).toContain("erreur")
  })
})

describe("updateNews", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("updates news article successfully", async () => {
    mockPrisma.news.findFirst.mockResolvedValue(null)
    mockPrisma.news.update.mockResolvedValue({
      id: "test-id",
      slug: "nouvelle-edition-du-festival",
    })

    const result = await updateNews("test-id", createFormData(validNewsData))

    expect(result.success).toBe(true)
    expect(mockPrisma.news.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "test-id" },
      })
    )
  })

  it("returns error for duplicate slug on different article", async () => {
    mockPrisma.news.findFirst.mockResolvedValue({ id: "other-id" })

    const result = await updateNews("test-id", createFormData(validNewsData))

    expect(result.success).toBe(false)
    expect(result.errors?.slug).toBeDefined()
  })
})

describe("deleteNews", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deletes news article successfully", async () => {
    mockPrisma.news.delete.mockResolvedValue({
      id: "test-id",
      slug: "nouvelle-edition-du-festival",
    })

    const result = await deleteNews("test-id")

    expect(result.success).toBe(true)
    expect(mockPrisma.news.delete).toHaveBeenCalledWith({
      where: { id: "test-id" },
    })
  })

  it("handles database errors gracefully", async () => {
    mockPrisma.news.delete.mockRejectedValue(new Error("Not found"))

    const result = await deleteNews("test-id")

    expect(result.success).toBe(false)
    expect(result.message).toContain("erreur")
  })
})

describe("getAdminNews", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns all news without search", async () => {
    const mockNews = [{ id: "1", title: "Article 1" }]
    mockPrisma.news.findMany.mockResolvedValue(mockNews)

    const result = await getAdminNews()

    expect(result).toEqual(mockNews)
    expect(mockPrisma.news.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        orderBy: { publishedAt: "desc" },
      })
    )
  })

  it("filters news by search query", async () => {
    mockPrisma.news.findMany.mockResolvedValue([])

    await getAdminNews("festival")

    expect(mockPrisma.news.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { title: { contains: "festival", mode: "insensitive" } },
            { excerpt: { contains: "festival", mode: "insensitive" } },
          ],
        },
      })
    )
  })
})

describe("getAdminNewsById", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns news by id", async () => {
    const mockArticle = { id: "test-id", title: "Test Article" }
    mockPrisma.news.findUnique.mockResolvedValue(mockArticle)

    const result = await getAdminNewsById("test-id")

    expect(result).toEqual(mockArticle)
  })

  it("returns null for non-existent article", async () => {
    mockPrisma.news.findUnique.mockResolvedValue(null)

    const result = await getAdminNewsById("non-existent")

    expect(result).toBeNull()
  })
})
