import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, mockRequireRole } = vi.hoisted(() => ({
  mockPrisma: {
    fundraisingSuggestion: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    event: { update: vi.fn() },
    $transaction: vi.fn(),
  },
  mockRequireRole: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))

import {
  attachFundraisingSuggestion,
  dismissFundraisingSuggestion,
  getFundraisingSuggestions,
} from "./fundraising"

const suggestion = {
  id: "s1",
  eventId: "e1",
  url: "https://www.fondation-patrimoine.org/les-projets/abbaye/123",
  title: "Abbaye aux Hommes",
  imageUrl: "https://strapi-upload.cdn.fondation-patrimoine.org/thumb.jpg",
  status: "PENDING",
  event: { slug: "abbaye" },
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
  mockPrisma.$transaction.mockImplementation(async (operations: unknown[]) => operations)
})

describe("fundraising suggestion actions", () => {
  it("require an editor before touching the database", async () => {
    mockRequireRole.mockRejectedValue(new Error("Forbidden"))

    await expect(getFundraisingSuggestions("e1")).rejects.toThrow("Forbidden")
    expect((await attachFundraisingSuggestion("s1")).success).toBe(false)
    expect((await dismissFundraisingSuggestion("s1")).success).toBe(false)

    expect(mockRequireRole).toHaveBeenCalledWith("EDITOR")
    expect(mockPrisma.fundraisingSuggestion.findMany).not.toHaveBeenCalled()
    expect(mockPrisma.fundraisingSuggestion.findUnique).not.toHaveBeenCalled()
    expect(mockPrisma.event.update).not.toHaveBeenCalled()
    expect(mockPrisma.fundraisingSuggestion.update).not.toHaveBeenCalled()
  })

  it("lists the suggestions an editor has not dismissed, same commune and nearest first", async () => {
    mockPrisma.fundraisingSuggestion.findMany.mockResolvedValue([])

    await getFundraisingSuggestions("e1")

    expect(mockPrisma.fundraisingSuggestion.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { eventId: "e1", status: { not: "REJECTED" } },
        orderBy: [{ reason: "asc" }, { distanceKm: { sort: "asc", nulls: "last" } }],
      })
    )
  })

  it("attaches a suggestion to its event only when the editor validates it", async () => {
    mockPrisma.fundraisingSuggestion.findUnique.mockResolvedValue(suggestion)

    const result = await attachFundraisingSuggestion("s1")

    expect(result).toEqual({
      success: true,
      message: expect.any(String),
      fundraising: { url: suggestion.url, title: suggestion.title, image: suggestion.imageUrl },
    })
    expect(mockPrisma.event.update).toHaveBeenCalledWith({
      where: { id: "e1" },
      data: {
        fundraisingUrl: suggestion.url,
        fundraisingTitle: suggestion.title,
        fundraisingImage: suggestion.imageUrl,
      },
    })
    expect(mockPrisma.fundraisingSuggestion.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: { status: "ACCEPTED" },
    })
  })

  it("refuses a dismissed suggestion or one whose link left fondation-patrimoine.org", async () => {
    mockPrisma.fundraisingSuggestion.findUnique.mockResolvedValueOnce({
      ...suggestion,
      status: "REJECTED",
    })
    expect((await attachFundraisingSuggestion("s1")).success).toBe(false)

    mockPrisma.fundraisingSuggestion.findUnique.mockResolvedValueOnce({
      ...suggestion,
      url: "https://evil.example/collecte",
    })
    expect((await attachFundraisingSuggestion("s1")).success).toBe(false)

    mockPrisma.fundraisingSuggestion.findUnique.mockResolvedValueOnce(null)
    expect((await attachFundraisingSuggestion("missing")).success).toBe(false)

    expect(mockPrisma.event.update).not.toHaveBeenCalled()
  })

  it("dismisses a suggestion without touching the event", async () => {
    mockPrisma.fundraisingSuggestion.update.mockResolvedValue({})

    expect((await dismissFundraisingSuggestion("s1")).success).toBe(true)
    expect(mockPrisma.fundraisingSuggestion.update).toHaveBeenCalledWith({
      where: { id: "s1" },
      data: { status: "REJECTED" },
    })
    expect(mockPrisma.event.update).not.toHaveBeenCalled()
  })
})
