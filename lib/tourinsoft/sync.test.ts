import { describe, it, expect, vi, beforeEach } from "vitest"
import type { TourinsoftOffer } from "./types"

const { mockPrisma, translateTextMock, requireRoleMock, correctMock } = vi.hoisted(() => ({
  mockPrisma: {
    event: {
      findMany: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    photo: { deleteMany: vi.fn() },
    syncRun: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
  translateTextMock: vi.fn(),
  requireRoleMock: vi.fn(),
  correctMock: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/storage", () => ({
  uploadImageFromUrl: vi.fn(async (url: string) => `stored:${url}`),
}))
vi.mock("@/lib/geo/geocode", () => ({ geocodeNormandyAddress: vi.fn(async () => null) }))
vi.mock("@/lib/ai/openrouter", () => ({
  isAiConfigured: () => true,
  translateText: translateTextMock,
}))
vi.mock("@/lib/ai/correct-texts", () => ({ correctImportedTexts: correctMock }))
// The cron has no session: if the sync ever goes through an auth-guarded action again, this throws.
vi.mock("@/lib/rbac", () => ({ requireRole: requireRoleMock }))

import {
  correctChangedTexts,
  ensureUniqueSlug,
  runTourinsoftSync,
  translateChangedFields,
} from "./sync"

const offer = (id: string, title: string, updated = "2026-11-01T10:00:00"): TourinsoftOffer =>
  ({
    SyndicObjectID: id,
    NomOffre: title,
    Descriptif: `Description de ${title}`,
    Insee: "14228",
    Updated: updated,
    LieuPrincipals: [{ Adresse1: "Château", Codepostal: "14000", Lieuprincipal: "CAEN" }],
    DateHorairess: [{ Datedebut: "2027-05-21T00:00:00", Datefin: "2027-05-21T00:00:00" }],
    GmapLatitude: "49.18",
    GmapLongitude: "-0.37",
  }) as TourinsoftOffer

describe("tourinsoft sync", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    requireRoleMock.mockRejectedValue(new Error("Unauthorized: not authenticated"))
    translateTextMock.mockImplementation(async (text: string) => `EN ${text}`)
    correctMock.mockImplementation(async (texts: { title: string; description: string }) => texts)
    mockPrisma.syncRun.findFirst.mockResolvedValue(null)
    mockPrisma.syncRun.create.mockResolvedValue({ id: "run-1" })
    mockPrisma.syncRun.update.mockResolvedValue({})
    mockPrisma.event.findMany.mockResolvedValue([])
    mockPrisma.event.create.mockResolvedValue({})
  })

  it("creates unknown offers with EN translations and no session", async () => {
    const result = await runTourinsoftSync({
      trigger: "cli",
      fetchOffers: async () => [offer("FMA1", "Lumières de Pontécoulant")],
    })

    expect(result).toMatchObject({ status: "SUCCESS", stats: { created: 1, failed: 0 } })
    const data = mockPrisma.event.create.mock.calls[0][0].data
    expect(data).toMatchObject({
      tourinsoftId: "FMA1",
      titleEn: "EN Lumières de Pontécoulant",
      published: true,
      slug: "lumieres-de-pontecoulant",
    })
    expect(requireRoleMock).not.toHaveBeenCalled()
    expect(mockPrisma.syncRun.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "SUCCESS", created: 1 }) })
    )
  })

  it("never overlaps a live run", async () => {
    mockPrisma.syncRun.findFirst.mockResolvedValue({ id: "running" })
    const fetchOffers = vi.fn()
    const result = await runTourinsoftSync({ trigger: "scheduler", fetchOffers })
    expect(result).toEqual({ status: "skipped", reason: "already-running" })
    expect(fetchOffers).not.toHaveBeenCalled()
  })

  it("records a failed run when the feed is unreachable", async () => {
    const result = await runTourinsoftSync({
      trigger: "cron",
      fetchOffers: async () => {
        throw new Error("Tourinsoft syndication error: 503")
      },
    })
    expect(result).toMatchObject({ status: "FAILED", error: "Tourinsoft syndication error: 503" })
    expect(mockPrisma.syncRun.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: "FAILED" }) })
    )
  })

  it("skips unchanged offers and never deletes or unpublishes events", async () => {
    mockPrisma.event.findMany.mockResolvedValue([
      { id: "e1", tourinsoftId: "FMA1", tourinsoftUpdatedAt: new Date("2026-11-02T00:00:00") },
    ])
    const result = await runTourinsoftSync({
      trigger: "cron",
      fetchOffers: async () => [offer("FMA1", "Canon")],
    })
    expect(result).toMatchObject({ stats: { skipped: 1, created: 0, updated: 0 } })
    expect(mockPrisma.event.update).not.toHaveBeenCalled()
  })
})

describe("imported text correction", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    translateTextMock.mockImplementation(async (text: string) => `EN ${text}`)
    mockPrisma.syncRun.findFirst.mockResolvedValue(null)
    mockPrisma.syncRun.create.mockResolvedValue({ id: "run-1" })
    mockPrisma.syncRun.update.mockResolvedValue({})
    mockPrisma.event.findMany.mockResolvedValue([])
    mockPrisma.event.create.mockResolvedValue({})
  })

  it("publishes the corrected text, keeps the source and translates the correction", async () => {
    correctMock.mockResolvedValue({ title: "Visite du château", description: "Une visite." })
    await runTourinsoftSync({
      trigger: "cli",
      fetchOffers: async () => [offer("FMA1", "VISITE DU CHATEAU")],
    })
    const data = mockPrisma.event.create.mock.calls[0][0].data
    expect(data).toMatchObject({
      titleFr: "Visite du château",
      descriptionFr: "Une visite.",
      sourceTitleFr: "VISITE DU CHATEAU",
      sourceDescriptionFr: "Description de VISITE DU CHATEAU",
      titleEn: "EN Visite du château",
    })
    expect(data.textsCorrectedAt).toBeInstanceOf(Date)
  })

  it("keeps the current copy while the source is unchanged", async () => {
    const current = {
      titleFr: "Visite du château (relue)",
      descriptionFr: "Relue.",
      sourceTitleFr: "VISITE",
      sourceDescriptionFr: "brut",
      textsCorrectedAt: new Date("2026-11-01"),
    }
    const result = await correctChangedTexts({ titleFr: "VISITE", descriptionFr: "brut" }, current)
    expect(result).toEqual(current)
    expect(correctMock).not.toHaveBeenCalled()
  })

  it("re-corrects when the source changes", async () => {
    correctMock.mockResolvedValue({ title: "Nouveau titre", description: "Nouveau texte." })
    const result = await correctChangedTexts(
      { titleFr: "NOUVEAU TITRE", descriptionFr: "nouveau texte" },
      {
        titleFr: "Ancien",
        descriptionFr: "Ancien.",
        sourceTitleFr: "ANCIEN",
        sourceDescriptionFr: "ancien",
        textsCorrectedAt: new Date("2026-11-01"),
      }
    )
    expect(result).toMatchObject({ titleFr: "Nouveau titre", sourceTitleFr: "NOUVEAU TITRE" })
  })

  it("falls back to the raw text and stays pending when the model fails", async () => {
    correctMock.mockRejectedValue(new Error("OpenRouter API error: 502"))
    vi.spyOn(console, "error").mockImplementation(() => {})
    const result = await correctChangedTexts({ titleFr: "BRUT", descriptionFr: "brut" }, null)
    expect(result).toEqual({
      titleFr: "BRUT",
      descriptionFr: "brut",
      sourceTitleFr: "BRUT",
      sourceDescriptionFr: "brut",
      textsCorrectedAt: null,
    })
  })

  it("does not call the model when AI is off for the import", async () => {
    const result = await correctChangedTexts({ titleFr: "BRUT", descriptionFr: "" }, null, {
      useAi: false,
    })
    expect(result.textsCorrectedAt).toBeNull()
    expect(correctMock).not.toHaveBeenCalled()
  })
})

describe("translateChangedFields", () => {
  beforeEach(() => {
    translateTextMock.mockImplementation(async (text: string) => `EN ${text}`)
  })

  it("keeps manual EN when the French source did not change", async () => {
    const result = await translateChangedFields(
      { titleFr: "Canon", descriptionFr: "Nouvelle description", pricingFr: null },
      {
        titleFr: "Canon",
        titleEn: "Canon castle (edited)",
        descriptionFr: "Ancienne description",
        descriptionEn: "Old",
        pricingFr: null,
        pricingEn: null,
      }
    )
    expect(result).not.toHaveProperty("titleEn")
    expect(result.descriptionEn).toBe("EN Nouvelle description")
  })
})

describe("ensureUniqueSlug", () => {
  it("suffixes taken slugs", async () => {
    mockPrisma.event.findMany.mockResolvedValue([{ slug: "visite" }, { slug: "visite-2" }])
    await expect(ensureUniqueSlug("visite")).resolves.toBe("visite-3")
  })

  it("keeps a free slug", async () => {
    mockPrisma.event.findMany.mockResolvedValue([{ slug: "visite-nocturne" }])
    await expect(ensureUniqueSlug("visite")).resolves.toBe("visite")
  })
})
