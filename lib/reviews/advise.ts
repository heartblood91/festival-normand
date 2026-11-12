// Not a server action: reachable only from code that already decided the call
// is legitimate (a fresh public submission or an editor's request).
import { prisma } from "@/lib/prisma"
import { isAiConfigured } from "@/lib/ai/openrouter"
import { moderateReview } from "@/lib/ai/moderate-review"

/** Stores the model's advice; failures leave the review for an editor to judge alone. */
export const adviseOnReview = async (reviewId: string): Promise<boolean> => {
  if (!isAiConfigured()) return false
  const review = await prisma.eventReview.findUnique({
    where: { id: reviewId },
    select: { authorName: true, rating: true, comment: true, event: { select: { titleFr: true } } },
  })
  if (!review) return false
  try {
    const advice = await moderateReview({
      eventTitle: review.event.titleFr,
      authorName: review.authorName,
      rating: review.rating,
      comment: review.comment,
    })
    if (!advice) return false
    await prisma.eventReview.update({
      where: { id: reviewId },
      data: { aiVerdict: advice.verdict, aiReason: advice.reason || null },
    })
    return true
  } catch (error) {
    console.error("Review moderation failed:", error instanceof Error ? error.message : error)
    return false
  }
}
