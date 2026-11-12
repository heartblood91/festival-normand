import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, headerValues, mockAdvise, afterCallbacks } = vi.hoisted(() => ({
  mockPrisma: {
    event: { findFirst: vi.fn() },
    eventReview: { create: vi.fn() },
  },
  headerValues: new Map<string, string>(),
  mockAdvise: vi.fn(),
  afterCallbacks: [] as (() => unknown)[],
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("next/headers", () => ({ headers: async () => headerValues }))
vi.mock("next/server", () => ({
  after: (callback: () => unknown) => afterCallbacks.push(callback),
}))
vi.mock("@/lib/queries/visibility", () => ({ publicEventWhere: async () => ({ published: true }) }))
vi.mock("@/lib/reviews/advise", () => ({ adviseOnReview: mockAdvise }))

import { submitEventReview } from "./review-submit"

const form = (data: Record<string, string>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return formData
}

const valid = { authorName: "Anne", rating: "5", comment: "Magnifique mise en lumière." }

const submit = (data: Record<string, string>, locale = "fr") =>
  submitEventReview("chateau-canon", locale, { status: "idle" }, form(data))

beforeEach(() => {
  vi.clearAllMocks()
  afterCallbacks.length = 0
  headerValues.clear()
  mockPrisma.event.findFirst.mockResolvedValue({ id: "e1", dateStart: new Date("2026-09-19") })
  mockPrisma.eventReview.create.mockResolvedValue({ id: "r1" })
})

describe("submitEventReview", () => {
  it("queues the review as pending and asks the AI after responding", async () => {
    headerValues.set("x-forwarded-for", "10.1.0.1")
    expect(await submit(valid, "en")).toEqual({ status: "sent" })

    expect(mockPrisma.event.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { AND: [{ slug: "chateau-canon" }, { published: true }] } })
    )
    expect(mockPrisma.eventReview.create).toHaveBeenCalledWith({
      data: {
        eventId: "e1",
        authorName: "Anne",
        rating: 5,
        comment: "Magnifique mise en lumière.",
        locale: "en",
      },
      select: { id: true },
    })
    expect(mockAdvise).not.toHaveBeenCalled()
    await afterCallbacks[0]()
    expect(mockAdvise).toHaveBeenCalledWith("r1")
  })

  it("returns field errors without storing anything", async () => {
    expect(await submit({ authorName: "", rating: "", comment: "Bof" })).toEqual({
      status: "invalid",
      errors: { authorName: "required", rating: "required", comment: "tooShort" },
    })
    expect(mockPrisma.eventReview.create).not.toHaveBeenCalled()
  })

  it("drops the honeypot, refuses unknown and not-yet-open sites", async () => {
    expect(await submit({ ...valid, website: "spam" })).toEqual({ status: "sent" })
    mockPrisma.event.findFirst.mockResolvedValueOnce(null)
    expect(await submit(valid)).toEqual({ status: "error" })
    mockPrisma.event.findFirst.mockResolvedValueOnce({
      id: "e2",
      dateStart: new Date(Date.now() + 86_400_000),
    })
    expect(await submit(valid)).toEqual({ status: "closed" })
    expect(mockPrisma.eventReview.create).not.toHaveBeenCalled()
  })

  it("limits a flood from one connection", async () => {
    headerValues.set("x-forwarded-for", "10.1.0.99")
    const results = []
    for (let i = 0; i < 6; i++) results.push((await submit(valid)).status)
    expect(results.filter((status) => status === "sent")).toHaveLength(5)
    expect(results.at(-1)).toBe("limited")
  })
})
