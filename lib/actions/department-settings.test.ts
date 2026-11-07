import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, mockRequireRole, mockRevalidateTag } = vi.hoisted(() => ({
  mockPrisma: {
    departmentSetting: { upsert: vi.fn() },
    $transaction: vi.fn(),
  },
  mockRequireRole: vi.fn(),
  mockRevalidateTag: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), revalidateTag: mockRevalidateTag }))

import { updateDepartmentEmbargo } from "./department-settings"

const form = (data: Record<string, string>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return formData
}

describe("updateDepartmentEmbargo", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
    mockPrisma.departmentSetting.upsert.mockImplementation((args) => args)
    mockPrisma.$transaction.mockResolvedValue([])
  })

  it("requires the EDITOR role before touching the database", async () => {
    mockRequireRole.mockRejectedValue(new Error("Accès refusé"))
    const result = await updateDepartmentEmbargo(form({ CALVADOS: "2027-03-15" }))
    expect(result.success).toBe(false)
    expect(mockRequireRole).toHaveBeenCalledWith("EDITOR")
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })

  it("stores one date per department, empty meaning no embargo", async () => {
    const result = await updateDepartmentEmbargo(form({ CALVADOS: "2027-03-15", ORNE: "" }))
    expect(result.success).toBe(true)
    const upserts = mockPrisma.departmentSetting.upsert.mock.calls.map(([args]) => args)
    expect(upserts).toHaveLength(5)
    const calvados = upserts.find((args) => args.where.department === "CALVADOS")
    expect(calvados.update.publishFrom).toEqual(new Date("2027-03-15T00:00:00"))
    const orne = upserts.find((args) => args.where.department === "ORNE")
    expect(orne.update.publishFrom).toBeNull()
    expect(mockRevalidateTag).toHaveBeenCalledWith("events", expect.anything())
  })

  it("rejects a malformed date", async () => {
    const result = await updateDepartmentEmbargo(form({ CALVADOS: "15/03/2027" }))
    expect(result.success).toBe(false)
    expect(mockPrisma.$transaction).not.toHaveBeenCalled()
  })
})
