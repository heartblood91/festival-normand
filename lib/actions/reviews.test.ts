import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const { mockPrisma, mockRequireRole, mockAdvise, mockUpdateTag } = vi.hoisted(() => ({
  mockPrisma: {
    eventReview: { findMany: vi.fn(), groupBy: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
  mockRequireRole: vi.fn(),
  mockAdvise: vi.fn(),
  mockUpdateTag: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: mockUpdateTag }))
vi.mock("@/lib/reviews/advise", () => ({ adviseOnReview: mockAdvise }))

import { deleteReview, getAdminReviews, requestReviewAdvice, setReviewStatus } from "./reviews"

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("OPENROUTER_API_KEY", "test-key")
  mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
  mockPrisma.eventReview.update.mockResolvedValue({ event: { slug: "chateau-canon" } })
  mockPrisma.eventReview.delete.mockResolvedValue({ event: { slug: "chateau-canon" } })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("review actions", () => {
  it("requires an editor before touching the database or the AI", async () => {
    mockRequireRole.mockRejectedValue(new Error("Forbidden"))

    await expect(getAdminReviews("PENDING")).rejects.toThrow("Forbidden")
    expect((await setReviewStatus("r1", "APPROVED")).success).toBe(false)
    expect((await deleteReview("r1")).success).toBe(false)
    expect((await requestReviewAdvice("r1")).success).toBe(false)
    expect(mockPrisma.eventReview.update).not.toHaveBeenCalled()
    expect(mockPrisma.eventReview.delete).not.toHaveBeenCalled()
    expect(mockAdvise).not.toHaveBeenCalled()
  })

  it("lists one status with the count of every status", async () => {
    mockPrisma.eventReview.findMany.mockResolvedValue([])
    mockPrisma.eventReview.groupBy.mockResolvedValue([
      { status: "PENDING", _count: { _all: 3 } },
      { status: "APPROVED", _count: { _all: 7 } },
    ])

    const data = await getAdminReviews("PENDING")
    expect(data.totals).toEqual({ PENDING: 3, APPROVED: 7, REJECTED: 0 })
    expect(data.aiConfigured).toBe(true)
    expect(mockPrisma.eventReview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" } })
    )
  })

  it("publishes a review and refreshes the public caches", async () => {
    const result = await setReviewStatus("r1", "APPROVED")
    expect(result).toEqual({ success: true, message: "Avis publié." })
    expect(mockPrisma.eventReview.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "r1" },
        data: { status: "APPROVED", moderatedAt: expect.any(Date) },
      })
    )
    expect(mockUpdateTag).toHaveBeenCalledWith("reviews")
  })

  it("clears the decision date when a review goes back to pending", async () => {
    await setReviewStatus("r1", "PENDING")
    expect(mockPrisma.eventReview.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "PENDING", moderatedAt: null } })
    )
  })

  it("rejects an unknown status", async () => {
    expect((await setReviewStatus("r1", "SPAM" as never)).success).toBe(false)
    expect(mockPrisma.eventReview.update).not.toHaveBeenCalled()
  })

  it("asks the AI again only when a key is configured", async () => {
    mockAdvise.mockResolvedValue(true)
    expect((await requestReviewAdvice("r1")).success).toBe(true)
    expect(mockAdvise).toHaveBeenCalledWith("r1")

    vi.stubEnv("OPENROUTER_API_KEY", "")
    mockAdvise.mockClear()
    expect((await requestReviewAdvice("r1")).success).toBe(false)
    expect(mockAdvise).not.toHaveBeenCalled()
  })
})
