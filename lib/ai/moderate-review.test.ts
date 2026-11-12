import { describe, it, expect, vi, beforeEach } from "vitest"

const { chatMock } = vi.hoisted(() => ({ chatMock: vi.fn() }))

vi.mock("@/lib/ai/openrouter", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/ai/openrouter")>()),
  chatCompletion: chatMock,
}))

import { MODERATION_MODEL, moderateReview } from "./moderate-review"

const review = {
  eventTitle: "Château de Canon",
  authorName: "Anne",
  rating: 2,
  comment: "Trop de monde, mais les illuminations étaient belles.",
}

describe("moderateReview", () => {
  beforeEach(() => {
    chatMock.mockReset()
  })

  it("asks the moderation model and returns its verdict", async () => {
    chatMock.mockResolvedValue('```json\n{"verdict": "approve", "reason": "Critique polie."}\n```')
    await expect(moderateReview(review)).resolves.toEqual({
      verdict: "approve",
      reason: "Critique polie.",
    })
    expect(chatMock).toHaveBeenCalledWith(expect.any(Array), {
      temperature: 0,
      model: MODERATION_MODEL,
    })
    expect(MODERATION_MODEL).toBe("typesafe/jev-router")
  })

  it("returns null for an unusable answer", async () => {
    chatMock.mockResolvedValue("Je ne sais pas.")
    await expect(moderateReview(review)).resolves.toBeNull()
    chatMock.mockResolvedValue('{"verdict": "maybe"}')
    await expect(moderateReview(review)).resolves.toBeNull()
  })

  it("lets network failures through so the review stays pending", async () => {
    chatMock.mockRejectedValue(new Error("OpenRouter API error: 503"))
    await expect(moderateReview(review)).rejects.toThrow("503")
  })
})
