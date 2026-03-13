import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    partner: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

import {
  createPartner,
  updatePartner,
  deletePartner,
  reorderPartners,
  getAdminPartners,
  getAdminPartnerById,
} from "./partners"

const createFormData = (data: Record<string, string>): FormData => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value)
  })
  return formData
}

const validPartnerData = {
  name: "Région Normandie",
  logo: "https://example.com/logo.png",
  website: "https://normandie.fr",
  order: "0",
}

describe("createPartner", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("creates partner successfully", async () => {
    mockPrisma.partner.create.mockResolvedValue({
      id: "test-id",
      name: "Région Normandie",
    })

    const result = await createPartner(createFormData(validPartnerData))

    expect(result.success).toBe(true)
    expect(result.partnerId).toBe("test-id")
    expect(mockPrisma.partner.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: "Région Normandie",
          website: "https://normandie.fr",
        }),
      })
    )
  })

  it("returns validation errors for invalid data", async () => {
    const result = await createPartner(
      createFormData({ ...validPartnerData, name: "a", website: "not-url" })
    )

    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
  })

  it("handles database errors gracefully", async () => {
    mockPrisma.partner.create.mockRejectedValue(new Error("DB error"))

    const result = await createPartner(createFormData(validPartnerData))

    expect(result.success).toBe(false)
    expect(result.message).toContain("erreur")
  })
})

describe("updatePartner", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("updates partner successfully", async () => {
    mockPrisma.partner.update.mockResolvedValue({
      id: "test-id",
      name: "Région Normandie",
    })

    const result = await updatePartner("test-id", createFormData(validPartnerData))

    expect(result.success).toBe(true)
    expect(mockPrisma.partner.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "test-id" },
      })
    )
  })

  it("returns validation errors for invalid data", async () => {
    const result = await updatePartner(
      "test-id",
      createFormData({ ...validPartnerData, name: "" })
    )

    expect(result.success).toBe(false)
    expect(result.errors).toBeDefined()
  })
})

describe("deletePartner", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("deletes partner successfully", async () => {
    mockPrisma.partner.delete.mockResolvedValue({ id: "test-id" })

    const result = await deletePartner("test-id")

    expect(result.success).toBe(true)
    expect(mockPrisma.partner.delete).toHaveBeenCalledWith({
      where: { id: "test-id" },
    })
  })

  it("handles database errors gracefully", async () => {
    mockPrisma.partner.delete.mockRejectedValue(new Error("Not found"))

    const result = await deletePartner("test-id")

    expect(result.success).toBe(false)
    expect(result.message).toContain("erreur")
  })
})

describe("reorderPartners", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("reorders partners successfully", async () => {
    mockPrisma.$transaction.mockResolvedValue([])

    const result = await reorderPartners(["id-1", "id-2", "id-3"])

    expect(result.success).toBe(true)
    expect(mockPrisma.$transaction).toHaveBeenCalled()
  })

  it("handles transaction errors gracefully", async () => {
    mockPrisma.$transaction.mockRejectedValue(new Error("TX error"))

    const result = await reorderPartners(["id-1", "id-2"])

    expect(result.success).toBe(false)
    expect(result.message).toContain("erreur")
  })
})

describe("getAdminPartners", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns partners ordered by order", async () => {
    const mockPartners = [
      { id: "1", name: "Partner 1", order: 0 },
      { id: "2", name: "Partner 2", order: 1 },
    ]
    mockPrisma.partner.findMany.mockResolvedValue(mockPartners)

    const result = await getAdminPartners()

    expect(result).toEqual(mockPartners)
    expect(mockPrisma.partner.findMany).toHaveBeenCalledWith({
      orderBy: { order: "asc" },
    })
  })
})

describe("getAdminPartnerById", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("returns partner by id", async () => {
    const mockPartner = { id: "test-id", name: "Test Partner" }
    mockPrisma.partner.findUnique.mockResolvedValue(mockPartner)

    const result = await getAdminPartnerById("test-id")

    expect(result).toEqual(mockPartner)
  })

  it("returns null for non-existent partner", async () => {
    mockPrisma.partner.findUnique.mockResolvedValue(null)

    const result = await getAdminPartnerById("non-existent")

    expect(result).toBeNull()
  })
})
