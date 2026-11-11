import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, mockRequireRole } = vi.hoisted(() => ({
  mockPrisma: {
    theme: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  mockRequireRole: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }))

import { createTheme, deleteTheme, getAdminThemes, updateTheme } from "./themes"

const form = (data: Record<string, string>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return formData
}

const valid = {
  nameFr: "Millénaire",
  nameEn: "Millennium",
  slug: "millennium",
  descriptionFr: "",
  descriptionEn: "",
  color: "#d97706",
  markerImage: "",
  showOnHome: "true",
  order: "0",
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
})

describe("theme actions", () => {
  it("require an editor before touching the database", async () => {
    mockRequireRole.mockRejectedValue(new Error("Forbidden"))

    await expect(getAdminThemes()).rejects.toThrow("Forbidden")
    expect((await createTheme(form(valid))).success).toBe(false)
    expect((await updateTheme("t1", form(valid))).success).toBe(false)
    expect((await deleteTheme("t1")).success).toBe(false)

    expect(mockRequireRole).toHaveBeenCalledWith("EDITOR")
    expect(mockPrisma.theme.findMany).not.toHaveBeenCalled()
    expect(mockPrisma.theme.create).not.toHaveBeenCalled()
    expect(mockPrisma.theme.update).not.toHaveBeenCalled()
    expect(mockPrisma.theme.delete).not.toHaveBeenCalled()
  })

  it("creates a theme with empty optional fields stored as null", async () => {
    mockPrisma.theme.findFirst.mockResolvedValue(null)
    mockPrisma.theme.create.mockResolvedValue({ id: "t1" })

    const result = await createTheme(form({ ...valid, nameEn: "" }))

    expect(result).toMatchObject({ success: true, themeId: "t1" })
    expect(mockPrisma.theme.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: "millennium",
        nameEn: null,
        markerImage: null,
        descriptionFr: null,
        showOnHome: true,
        color: "#d97706",
      }),
    })
  })

  it("refuses a slug already used by another theme", async () => {
    mockPrisma.theme.findFirst.mockResolvedValue({ id: "other" })

    const result = await updateTheme("t1", form(valid))

    expect(result.success).toBe(false)
    expect(result.errors?.slug).toBeDefined()
    expect(mockPrisma.theme.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "millennium", id: { not: "t1" } } })
    )
    expect(mockPrisma.theme.update).not.toHaveBeenCalled()
  })

  it("returns field errors for an invalid colour", async () => {
    const result = await createTheme(form({ ...valid, color: "red" }))
    expect(result.success).toBe(false)
    expect(result.errors?.color).toBeDefined()
  })

  it("stores the years and the skin of a yearly theme", async () => {
    mockPrisma.theme.findFirst.mockResolvedValue(null)
    mockPrisma.theme.create.mockResolvedValue({ id: "t1" })

    await createTheme(form({ ...valid, years: "2028, 2027", skin: "millennium" }))

    expect(mockPrisma.theme.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ years: [2027, 2028], skin: "millennium" }),
    })
  })

  it("stores no years and no skin when the fields are empty", async () => {
    mockPrisma.theme.findFirst.mockResolvedValue(null)
    mockPrisma.theme.create.mockResolvedValue({ id: "t1" })

    await createTheme(form({ ...valid, years: "", skin: "" }))

    expect(mockPrisma.theme.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ years: [], skin: null }),
    })
  })

  it("refuses invalid years and unknown skins", async () => {
    const result = await createTheme(form({ ...valid, years: "27", skin: "christmas" }))

    expect(result.success).toBe(false)
    expect(result.errors?.years).toBeDefined()
    expect(result.errors?.skin).toBeDefined()
    expect(mockPrisma.theme.create).not.toHaveBeenCalled()
  })

  it("deleting a theme only removes the theme, never its events", async () => {
    mockPrisma.theme.delete.mockResolvedValue({ id: "t1" })

    const result = await deleteTheme("t1")

    expect(result.success).toBe(true)
    expect(mockPrisma.theme.delete).toHaveBeenCalledWith({ where: { id: "t1" } })
  })
})
