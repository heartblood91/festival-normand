import { describe, it, expect } from "vitest"
import { reviewErrors, reviewSchema } from "./review"

const valid = { authorName: " Anne ", rating: "4", comment: "  Une très belle soirée.  " }

describe("reviewSchema", () => {
  it("trims the texts and coerces the rating", () => {
    expect(reviewSchema.parse(valid)).toEqual({
      authorName: "Anne",
      rating: 4,
      comment: "Une très belle soirée.",
    })
  })

  it("maps each field to a single translatable error code", () => {
    const result = reviewSchema.safeParse({ authorName: "", rating: "", comment: "Bof" })
    expect(result.success).toBe(false)
    expect(reviewErrors(result.error!.issues)).toEqual({
      authorName: "required",
      rating: "required",
      comment: "tooShort",
    })
  })

  it("rejects ratings outside 1–5 and over-long texts", () => {
    const result = reviewSchema.safeParse({
      authorName: "x".repeat(61),
      rating: "6",
      comment: "y".repeat(1001),
    })
    expect(reviewErrors(result.error!.issues)).toEqual({
      authorName: "tooLong",
      rating: "invalid",
      comment: "tooLong",
    })
  })
})
