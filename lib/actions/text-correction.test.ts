import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockRequireRole, mockCorrect, mockAiConfigured, mockRevalidatePath } = vi.hoisted(() => ({
  mockRequireRole: vi.fn(),
  mockCorrect: vi.fn(),
  mockAiConfigured: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("@/lib/ai/openrouter", () => ({ isAiConfigured: mockAiConfigured }))
vi.mock("@/lib/tourinsoft/text-correction", () => ({ correctPendingTexts: mockCorrect }))
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }))

import { correctImportedTextsBatch } from "./text-correction"

describe("correctImportedTextsBatch", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
    mockAiConfigured.mockReturnValue(true)
    mockCorrect.mockResolvedValue({
      corrected: 2,
      unchanged: 1,
      failed: 0,
      remaining: 7,
      slugs: ["canon", "vendeuvre"],
    })
  })

  it("requires the EDITOR role before calling the model", async () => {
    mockRequireRole.mockRejectedValue(new Error("Accès refusé"))
    await expect(correctImportedTextsBatch()).resolves.toMatchObject({
      success: false,
      message: "Accès refusé",
    })
    expect(mockRequireRole).toHaveBeenCalledWith("EDITOR")
    expect(mockCorrect).not.toHaveBeenCalled()
  })

  it("says when no AI key is configured", async () => {
    mockAiConfigured.mockReturnValue(false)
    const result = await correctImportedTextsBatch()
    expect(result.success).toBe(false)
    expect(result.message).toContain("OPENROUTER_API_KEY")
    expect(mockCorrect).not.toHaveBeenCalled()
  })

  it("corrects a batch of ten and refreshes the corrected public pages", async () => {
    const result = await correctImportedTextsBatch()
    expect(mockCorrect).toHaveBeenCalledWith(10)
    expect(result).toEqual({
      success: true,
      message: "2 fiches corrigées, 1 déjà correcte, 7 restantes.",
      remaining: 7,
    })
    expect(mockRevalidatePath).toHaveBeenCalledWith("/fr/evenement/canon")
    expect(mockRevalidatePath).toHaveBeenCalledWith("/en/evenement/vendeuvre")
  })
})
