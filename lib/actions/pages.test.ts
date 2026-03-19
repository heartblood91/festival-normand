import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    page: {
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
  createPage,
  updatePage,
  deletePage,
  getAdminPages,
  getAdminPageById,
} from "./pages"

const createFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

const validPageData = {
  titleFr: "À propos du festival",
  titleEn: "",
  slug: "a-propos",
  contentFr: "<p>Contenu de la page à propos du festival Pierres en Lumières.</p>",
  contentEn: "",
}

describe("createPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates page successfully", async () => {
    mockPrisma.page.findUnique.mockResolvedValue(null)
    mockPrisma.page.create.mockResolvedValue({
      id: "test-id",
      slug: "a-propos",
    })

    const result = await createPage(createFormData(validPageData))

    expect(result.success).toBe(true)
    expect(result.pageId).toBe("test-id")
    expect(mockPrisma.page.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          titleFr: "À propos du festival",
          slug: "a-propos",
        }),
      })
    )
  })

  it("returns validation errors for invalid data", async () => {
    const result = await createPage(
      createFormData({ ...validPageData, titleFr: "ab", contentFr: "short" })
    )

    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
    expect(result.errors?.titleFr).toBeDefined()
    expect(result.errors?.contentFr).toBeDefined()
  })

  it("returns error for duplicate slug", async () => {
    mockPrisma.page.findUnique.mockResolvedValue({ id: "existing-id" })

    const result = await createPage(createFormData(validPageData))

    expect(result.success).toBe(false)
    expect(result.errors?.slug).toBeDefined()
    expect(mockPrisma.page.create).not.toHaveBeenCalled()
  })

  it("handles database errors gracefully", async () => {
    mockPrisma.page.findUnique.mockResolvedValue(null)
    mockPrisma.page.create.mockRejectedValue(new Error("DB error"))

    const result = await createPage(createFormData(validPageData))

    expect(result.success).toBe(false)
    expect(result.message).toContain("erreur")
  })
})

describe("updatePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("updates page successfully", async () => {
    mockPrisma.page.findFirst.mockResolvedValue(null)
    mockPrisma.page.update.mockResolvedValue({
      id: "test-id",
      slug: "a-propos",
    })

    const result = await updatePage("test-id", createFormData(validPageData))

    expect(result.success).toBe(true)
    expect(mockPrisma.page.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "test-id" },
      })
    )
  })

  it("returns error for duplicate slug on different page", async () => {
    mockPrisma.page.findFirst.mockResolvedValue({ id: "other-id" })

    const result = await updatePage("test-id", createFormData(validPageData))

    expect(result.success).toBe(false)
    expect(result.errors?.slug).toBeDefined()
  })
})

describe("deletePage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deletes non-system page successfully", async () => {
    mockPrisma.page.findUnique.mockResolvedValue({
      id: "test-id",
      slug: "a-propos",
    })
    mockPrisma.page.delete.mockResolvedValue({ id: "test-id" })

    const result = await deletePage("test-id")

    expect(result.success).toBe(true)
    expect(mockPrisma.page.delete).toHaveBeenCalledWith({
      where: { id: "test-id" },
    })
  })

  it("prevents deletion of system pages", async () => {
    mockPrisma.page.findUnique.mockResolvedValue({
      id: "test-id",
      slug: "festival",
    })

    const result = await deletePage("test-id")

    expect(result.success).toBe(false)
    expect(result.message).toContain("système")
    expect(mockPrisma.page.delete).not.toHaveBeenCalled()
  })

  it("returns error for non-existent page", async () => {
    mockPrisma.page.findUnique.mockResolvedValue(null)

    const result = await deletePage("non-existent")

    expect(result.success).toBe(false)
    expect(result.message).toContain("introuvable")
  })

  it("handles database errors gracefully", async () => {
    mockPrisma.page.findUnique.mockResolvedValue({
      id: "test-id",
      slug: "a-propos",
    })
    mockPrisma.page.delete.mockRejectedValue(new Error("DB error"))

    const result = await deletePage("test-id")

    expect(result.success).toBe(false)
    expect(result.message).toContain("erreur")
  })
})

describe("getAdminPages", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns all pages ordered by title", async () => {
    const mockPages = [
      { id: "1", titleFr: "Festival", slug: "festival" },
      { id: "2", titleFr: "Inscription", slug: "inscription" },
    ]
    mockPrisma.page.findMany.mockResolvedValue(mockPages)

    const result = await getAdminPages()

    expect(result).toEqual(mockPages)
    expect(mockPrisma.page.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { titleFr: "asc" },
      })
    )
  })
})

describe("getAdminPageById", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns page by id", async () => {
    const mockPage = { id: "test-id", titleFr: "Test Page" }
    mockPrisma.page.findUnique.mockResolvedValue(mockPage)

    const result = await getAdminPageById("test-id")

    expect(result).toEqual(mockPage)
  })

  it("returns null for non-existent page", async () => {
    mockPrisma.page.findUnique.mockResolvedValue(null)

    const result = await getAdminPageById("non-existent")

    expect(result).toBeNull()
  })
})
