import { z } from "zod"

export const REVIEW_NAME_MAX = 60
export const REVIEW_COMMENT_MIN = 10
export const REVIEW_COMMENT_MAX = 1000
export const REVIEW_RATINGS = [1, 2, 3, 4, 5] as const

export type ReviewField = "authorName" | "rating" | "comment"
export type ReviewFieldError = "required" | "tooShort" | "tooLong" | "invalid"

// Error codes rather than messages: the public form translates them.
export const reviewSchema = z.object({
  authorName: z.string().trim().min(1, "required").max(REVIEW_NAME_MAX, "tooLong"),
  rating: z.coerce
    .number({ error: "required" })
    .int("invalid")
    .min(1, "required")
    .max(5, "invalid"),
  comment: z
    .string()
    .trim()
    .min(1, "required")
    .min(REVIEW_COMMENT_MIN, "tooShort")
    .max(REVIEW_COMMENT_MAX, "tooLong"),
})

export type ReviewInput = z.infer<typeof reviewSchema>

export const reviewErrors = (
  issues: { path: PropertyKey[]; message: string }[]
): Partial<Record<ReviewField, ReviewFieldError>> => {
  const errors: Partial<Record<ReviewField, ReviewFieldError>> = {}
  for (const issue of issues) {
    const field = issue.path[0] as ReviewField
    if (errors[field]) continue
    const code = issue.message as ReviewFieldError
    errors[field] = ["required", "tooShort", "tooLong"].includes(code) ? code : "invalid"
  }
  return errors
}
