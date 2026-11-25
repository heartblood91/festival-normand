import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, mockRequireRole, mockUpdateTag, mockRevalidatePath } = vi.hoisted(() => ({
  mockPrisma: { siteSetting: { upsert: vi.fn() } },
  mockRequireRole: vi.fn(),
  mockUpdateTag: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath, updateTag: mockUpdateTag }))

import { updatePassPatrimoineSettings } from "./site-settings"

const form = (data: Record<string, string | string[]>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) =>
    [value].flat().forEach((item) => formData.append(key, item))
  )
  return formData
}

const valid = {
  passEnabled: "true",
  bannerEnabled: "true",
  bannerTextFr: "  Texte FR  ",
  bannerTextEn: "EN text",
  bannerUrl: "https://www.pass-patrimoine.fr/fr/offrir",
  bannerStart: "",
  bannerEnd: "2027-01-31",
  bannerPages: ["home", "event"],
}

describe("updatePassPatrimoineSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
    mockPrisma.siteSetting.upsert.mockResolvedValue({})
  })

  it("requires the EDITOR role before touching the database", async () => {
    mockRequireRole.mockRejectedValue(new Error("Accès refusé"))
    const result = await updatePassPatrimoineSettings(form(valid))
    expect(result).toEqual({ success: false, message: "Accès refusé" })
    expect(mockRequireRole).toHaveBeenCalledWith("EDITOR")
    expect(mockPrisma.siteSetting.upsert).not.toHaveBeenCalled()
  })

  it("stores the parsed settings and refreshes the public pages", async () => {
    const result = await updatePassPatrimoineSettings(form(valid))
    expect(result.success).toBe(true)
    const [{ where, update }] = mockPrisma.siteSetting.upsert.mock.calls[0]
    expect(where).toEqual({ key: "pass-patrimoine" })
    expect(update.value).toMatchObject({
      passEnabled: true,
      bannerTextFr: "Texte FR",
      bannerStart: null,
      bannerEnd: "2027-01-31",
      bannerPages: ["home", "event"],
    })
    expect(mockUpdateTag).toHaveBeenCalledWith("settings")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/fr/evenements")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/[locale]/(public)/evenement/[slug]", "page")
  })

  it("reads unchecked boxes as off", async () => {
    await updatePassPatrimoineSettings(
      form({ ...valid, passEnabled: "false", bannerEnabled: "false", bannerPages: [] })
    )
    const [{ update }] = mockPrisma.siteSetting.upsert.mock.calls[0]
    expect(update.value).toMatchObject({ passEnabled: false, bannerEnabled: false })
  })

  it("returns field errors without saving", async () => {
    const result = await updatePassPatrimoineSettings(
      form({ ...valid, bannerUrl: "https://example.com", bannerPages: ["unknown"] })
    )
    expect(result.success).toBe(false)
    expect(result.errors?.bannerUrl).toBeDefined()
    expect(result.errors?.bannerPages).toBeDefined()
    expect(mockPrisma.siteSetting.upsert).not.toHaveBeenCalled()
    expect(mockUpdateTag).not.toHaveBeenCalled()
  })
})
