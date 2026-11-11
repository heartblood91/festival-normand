import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, mockRequireRole } = vi.hoisted(() => ({
  mockPrisma: {
    galleryPhoto: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      createMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
  mockRequireRole: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }))

import {
  addGalleryPhotos,
  deleteGalleryPhoto,
  getAdminGallery,
  reorderGalleryPhotos,
  updateGalleryPhoto,
} from "./gallery"

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
  mockPrisma.galleryPhoto.findFirst.mockResolvedValue({ order: 4 })
})

describe("gallery actions", () => {
  it("requires an editor before touching the database", async () => {
    mockRequireRole.mockRejectedValue(new Error("Forbidden"))

    await expect(getAdminGallery()).rejects.toThrow("Forbidden")
    expect((await addGalleryPhotos(2026, ["/uploads/a.webp"])).success).toBe(false)
    expect(
      (await updateGalleryPhoto("p1", { altFr: "Une façade", altEn: "", credit: "", year: 2026 }))
        .success
    ).toBe(false)
    expect((await deleteGalleryPhoto("p1")).success).toBe(false)
    expect((await reorderGalleryPhotos(2026, ["p1"])).success).toBe(false)
    expect(mockPrisma.galleryPhoto.createMany).not.toHaveBeenCalled()
    expect(mockPrisma.galleryPhoto.update).not.toHaveBeenCalled()
    expect(mockPrisma.galleryPhoto.delete).not.toHaveBeenCalled()
  })

  it("appends new photos after the year's last one, as drafts", async () => {
    const result = await addGalleryPhotos(2026, ["/uploads/a.webp", "/uploads/b.webp"])

    expect(result.success).toBe(true)
    expect(mockPrisma.galleryPhoto.createMany).toHaveBeenCalledWith({
      data: [
        { url: "/uploads/a.webp", year: 2026, order: 5 },
        { url: "/uploads/b.webp", year: 2026, order: 6 },
      ],
    })
  })

  it("refuses foreign image addresses", async () => {
    const result = await addGalleryPhotos(2026, ["https://evil.example/x.jpg", "javascript:x"])

    expect(result.success).toBe(false)
    expect(mockPrisma.galleryPhoto.createMany).not.toHaveBeenCalled()
  })

  it("keeps the order when the year is unchanged and stores empty fields as null", async () => {
    mockPrisma.galleryPhoto.findUnique.mockResolvedValue({ year: 2026 })

    const result = await updateGalleryPhoto("p1", {
      altFr: " Le chœur illuminé ",
      altEn: "",
      credit: "",
      year: 2026,
    })

    expect(result.success).toBe(true)
    expect(mockPrisma.galleryPhoto.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { altFr: "Le chœur illuminé", altEn: null, credit: null, year: 2026, order: undefined },
    })
  })

  it("moves a photo to the end of its new year", async () => {
    mockPrisma.galleryPhoto.findUnique.mockResolvedValue({ year: 2025 })

    await updateGalleryPhoto("p1", { altFr: "Le chœur", altEn: "", credit: "A. B.", year: 2026 })

    expect(mockPrisma.galleryPhoto.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ year: 2026, order: 5 }) })
    )
  })

  it("returns field errors without saving", async () => {
    const result = await updateGalleryPhoto("p1", { altFr: "", altEn: "", credit: "", year: 2026 })

    expect(result.success).toBe(false)
    expect(result.errors?.altFr).toBeDefined()
    expect(mockPrisma.galleryPhoto.update).not.toHaveBeenCalled()
  })

  it("only reorders photos of the given year", async () => {
    await reorderGalleryPhotos(2026, ["b", "a"])

    expect(mockPrisma.galleryPhoto.updateMany).toHaveBeenCalledWith({
      where: { id: "b", year: 2026 },
      data: { order: 0 },
    })
    expect(mockPrisma.galleryPhoto.updateMany).toHaveBeenCalledWith({
      where: { id: "a", year: 2026 },
      data: { order: 1 },
    })
  })
})
