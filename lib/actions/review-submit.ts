"use server"

import { after } from "next/server"
import { prisma } from "@/lib/prisma"
import { clientKey, createRateLimiter } from "@/lib/rate-limit"
import {
  reviewErrors,
  reviewSchema,
  type ReviewField,
  type ReviewFieldError,
} from "@/lib/schemas/review"
import { publicEventWhere } from "@/lib/queries/visibility"
import { adviseOnReview } from "@/lib/reviews/advise"
import { locales, type Locale } from "@/lib/i18n/config"

export type ReviewSubmitResult = {
  status: "idle" | "sent" | "invalid" | "error" | "limited" | "closed"
  errors?: Partial<Record<ReviewField, ReviewFieldError>>
}

const isRateLimited = createRateLimiter({ windowMs: 60 * 60_000, max: 5 })

/** Public, anonymous: queues a review of a site that has opened to visitors. */
export const submitEventReview = async (
  slug: string,
  locale: string,
  _prev: ReviewSubmitResult,
  formData: FormData
): Promise<ReviewSubmitResult> => {
  // Bots filling the hidden field get the same answer as people.
  if (formData.get("website")) return { status: "sent" }

  const parsed = reviewSchema.safeParse({
    authorName: formData.get("authorName") ?? "",
    rating: formData.get("rating") ?? "",
    comment: formData.get("comment") ?? "",
  })
  if (!parsed.success) return { status: "invalid", errors: reviewErrors(parsed.error.issues) }

  try {
    const now = new Date()
    const event = await prisma.event.findFirst({
      where: { AND: [{ slug }, await publicEventWhere(now)] },
      select: { id: true, dateStart: true },
    })
    if (!event) return { status: "error" }
    if (event.dateStart > now) return { status: "closed" }

    if (isRateLimited(await clientKey())) return { status: "limited" }

    const review = await prisma.eventReview.create({
      data: {
        eventId: event.id,
        ...parsed.data,
        locale: locales.includes(locale as Locale) ? locale : "fr",
      },
      select: { id: true },
    })
    after(() => adviseOnReview(review.id))
    return { status: "sent" }
  } catch (error) {
    console.error("Review submission failed:", error)
    return { status: "error" }
  }
}
