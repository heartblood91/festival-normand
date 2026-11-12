import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const { mockPrisma, mockModerate } = vi.hoisted(() => ({
  mockPrisma: { eventReview: { findUnique: vi.fn(), update: vi.fn() } },
  mockModerate: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/ai/moderate-review", () => ({ moderateReview: mockModerate }))

import { adviseOnReview } from "./advise"

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv("OPENROUTER_API_KEY", "test-key")
  vi.spyOn(console, "error").mockImplementation(() => undefined)
  mockPrisma.eventReview.findUnique.mockResolvedValue({
    authorName: "Anne",
    rating: 1,
    comment: "Achetez mes montres sur example.com",
    event: { titleFr: "Château de Canon" },
  })
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe("adviseOnReview", () => {
  it("stores the verdict without changing the status", async () => {
    mockModerate.mockResolvedValue({ verdict: "reject", reason: "Publicité." })
    expect(await adviseOnReview("r1")).toBe(true)
    expect(mockPrisma.eventReview.update).toHaveBeenCalledWith({
      where: { id: "r1" },
      data: { aiVerdict: "reject", aiReason: "Publicité." },
    })
  })

  it("does nothing without a key and survives a model failure", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "")
    expect(await adviseOnReview("r1")).toBe(false)
    expect(mockModerate).not.toHaveBeenCalled()

    vi.stubEnv("OPENROUTER_API_KEY", "test-key")
    mockModerate.mockRejectedValue(new Error("timeout"))
    expect(await adviseOnReview("r1")).toBe(false)
    expect(mockPrisma.eventReview.update).not.toHaveBeenCalled()
  })
})
