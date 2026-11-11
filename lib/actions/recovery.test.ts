import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockRequireRole, mockFetch, mockImport, mockRevalidatePath } = vi.hoisted(() => ({
  mockRequireRole: vi.fn(),
  mockFetch: vi.fn(),
  mockImport: vi.fn(),
  mockRevalidatePath: vi.fn(),
}))

vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("@/lib/directus/client", () => ({ fetchDirectusEvents: mockFetch }))
vi.mock("@/lib/directus/import", () => ({ importDirectusEvents: mockImport }))
vi.mock("next/cache", () => ({ revalidatePath: mockRevalidatePath }))

import { previewLegacyRecovery, recoverLegacyEvents } from "./recovery"

const v1 = (id: string, year: string, status = "published") => ({
  id,
  status,
  title: `Site ${id}`,
  datehorairess: [{ Datedebut: `${year}-05-29T00:00:00` }],
  syndic_object_id: `FMANOR${id}`,
})

const form = (ids: string[], extra: Record<string, string> = {}) => {
  const data = new FormData()
  data.append("year", "2026")
  ids.forEach((id) => data.append("tourinsoftId", id))
  Object.entries(extra).forEach(([key, value]) => data.append(key, value))
  return data
}

const report = { total: 0, knownById: 0, knownBySite: {}, created: 0, failed: 0, planned: [] }

describe("previewLegacyRecovery", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
    mockFetch.mockResolvedValue([v1("1", "2026"), v1("2", "2025"), v1("3", "2026", "draft")])
    mockImport.mockResolvedValue(report)
  })

  it("requires the EDITOR role before calling v1", async () => {
    mockRequireRole.mockRejectedValue(new Error("Accès refusé"))
    await expect(previewLegacyRecovery("2026")).rejects.toThrow("Accès refusé")
    expect(mockRequireRole).toHaveBeenCalledWith("EDITOR")
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it("dry-runs the published events of one edition and lists the editions", async () => {
    const preview = await previewLegacyRecovery("2026")
    const [events, options] = mockImport.mock.calls[0]
    expect(events.map((event: { id: string }) => event.id)).toEqual(["1"])
    expect(options).toMatchObject({ dryRun: true, publish: false })
    expect(preview.years).toEqual(["2026", "2025"])
  })
})

describe("recoverLegacyEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
    mockFetch.mockResolvedValue([v1("1", "2026"), v1("2", "2026"), v1("3", "2025")])
    mockImport.mockResolvedValue({ ...report, created: 1 })
  })

  it("requires the EDITOR role before anything else", async () => {
    mockRequireRole.mockRejectedValue(new Error("Accès refusé"))
    const result = await recoverLegacyEvents(null, form(["FMANOR1"]))
    expect(result.success).toBe(false)
    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockImport).not.toHaveBeenCalled()
  })

  it("imports only the ticked sites of the edition, as drafts", async () => {
    const result = await recoverLegacyEvents(null, form(["FMANOR1", "FMANOR3"]))
    const [events, options] = mockImport.mock.calls[0]
    expect(events.map((event: { id: string }) => event.id)).toEqual(["1"])
    expect(options).toMatchObject({ dryRun: false, publish: false, downloadPhotos: false })
    expect(result).toMatchObject({ success: true, created: 1 })
    expect(result.message).toMatch(/1 site importé en brouillon/)
  })

  it("downloads the photos only when asked", async () => {
    await recoverLegacyEvents(null, form(["FMANOR1"], { photos: "on" }))
    expect(mockImport.mock.calls[0][1]).toMatchObject({ downloadPhotos: true })
  })

  it("refuses an empty selection and batches larger than 20", async () => {
    expect((await recoverLegacyEvents(null, form([]))).success).toBe(false)
    const many = Array.from({ length: 21 }, (_, index) => `FMANOR${index}`)
    expect((await recoverLegacyEvents(null, form(many))).message).toMatch(/20 sites/)
    expect(mockImport).not.toHaveBeenCalled()
  })
})
