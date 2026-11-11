import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, mockRequireRole, mockUpdateTag } = vi.hoisted(() => ({
  mockPrisma: { edition: { upsert: vi.fn() } },
  mockRequireRole: vi.fn(),
  mockUpdateTag: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: mockUpdateTag }))

import { updateEdition } from "./edition"

const form = (data: Record<string, string>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return formData
}

const valid = { year: "2027", dateStart: "2027-05-21", dateEnd: "2027-05-23", bilanFrom: "" }

describe("updateEdition", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
    mockPrisma.edition.upsert.mockResolvedValue({})
  })

  it("requires the EDITOR role before touching the database", async () => {
    mockRequireRole.mockRejectedValue(new Error("Accès refusé"))
    const result = await updateEdition(form(valid))
    expect(result.success).toBe(false)
    expect(mockRequireRole).toHaveBeenCalledWith("EDITOR")
    expect(mockPrisma.edition.upsert).not.toHaveBeenCalled()
  })

  it("saves the edition dates as UTC calendar days and refreshes the public pages", async () => {
    const result = await updateEdition(form(valid))
    expect(result.success).toBe(true)
    expect(mockPrisma.edition.upsert).toHaveBeenCalledWith({
      where: { year: 2027 },
      update: {
        dateStart: new Date("2027-05-21T00:00:00Z"),
        dateEnd: new Date("2027-05-23T00:00:00Z"),
        bilanFrom: null,
      },
      create: {
        year: 2027,
        dateStart: new Date("2027-05-21T00:00:00Z"),
        dateEnd: new Date("2027-05-23T00:00:00Z"),
        bilanFrom: null,
      },
    })
    expect(mockUpdateTag).toHaveBeenCalledWith("edition")
  })

  it("rejects an end date before the start date", async () => {
    const result = await updateEdition(form({ ...valid, dateEnd: "2027-05-20" }))
    expect(result.success).toBe(false)
    expect(mockPrisma.edition.upsert).not.toHaveBeenCalled()
  })
})
