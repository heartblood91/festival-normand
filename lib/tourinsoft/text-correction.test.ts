import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, mockCorrect, mockTranslate } = vi.hoisted(() => ({
  mockPrisma: { event: { findMany: vi.fn(), update: vi.fn(), count: vi.fn() } },
  mockCorrect: vi.fn(),
  mockTranslate: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/ai/correct-texts", () => ({ correctImportedTexts: mockCorrect }))
vi.mock("@/lib/tourinsoft/sync", () => ({ translateChangedFields: mockTranslate }))

import { correctPendingTexts } from "./text-correction"

const event = (id: string, titleFr: string, source: string | null = null) => ({
  id,
  slug: id,
  titleFr,
  titleEn: null,
  descriptionFr: "texte",
  descriptionEn: null,
  pricingFr: null,
  pricingEn: null,
  sourceTitleFr: source,
  sourceDescriptionFr: source ? "texte" : null,
})

describe("correctPendingTexts", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockPrisma.event.count.mockResolvedValue(3)
    mockTranslate.mockResolvedValue({ titleEn: "EN" })
    vi.spyOn(console, "error").mockImplementation(() => {})
  })

  it("corrects the current text, keeps the source and leaves model errors pending", async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      event("a", "CANON"),
      event("b", "Vendeuvre", "VENDEUVRE"),
      event("c", "Brécy"),
    ])
    mockCorrect
      .mockResolvedValueOnce({ title: "Canon", description: "texte" })
      .mockResolvedValueOnce({ title: "Vendeuvre", description: "texte" })
      .mockRejectedValueOnce(new Error("OpenRouter API error: 502"))

    const report = await correctPendingTexts(10)

    expect(mockPrisma.event.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { tourinsoftId: { not: null }, textsCorrectedAt: null },
        take: 10,
      })
    )
    expect(report).toEqual({ corrected: 1, unchanged: 1, failed: 1, remaining: 3, slugs: ["a"] })
    expect(mockPrisma.event.update).toHaveBeenCalledTimes(2)
    expect(mockPrisma.event.update.mock.calls[0][0].data).toMatchObject({
      titleFr: "Canon",
      titleEn: "EN",
      sourceTitleFr: "CANON",
    })
    expect(mockPrisma.event.update.mock.calls[1][0].data).toMatchObject({
      titleFr: "Vendeuvre",
      sourceTitleFr: "VENDEUVRE",
    })
    expect(mockTranslate).toHaveBeenCalledTimes(1)
  })
})
