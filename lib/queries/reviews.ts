import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"

export const PUBLIC_REVIEWS_LIMIT = 20

export type PublicReview = {
  id: string
  authorName: string
  rating: number
  comment: string
  locale: string
  /** ISO string: the cache stores JSON. */
  createdAt: string
}

export type EventReviewSummary = {
  average: number | null
  count: number
  reviews: PublicReview[]
}

/** Approved reviews only; the average covers all of them, the list the latest ones. */
export const getEventReviews = (eventId: string) =>
  cachedQuery(
    async (): Promise<EventReviewSummary> => {
      const where = { eventId, status: "APPROVED" as const }
      const [stats, reviews] = await Promise.all([
        prisma.eventReview.aggregate({ where, _avg: { rating: true }, _count: { _all: true } }),
        prisma.eventReview.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: PUBLIC_REVIEWS_LIMIT,
          select: {
            id: true,
            authorName: true,
            rating: true,
            comment: true,
            locale: true,
            createdAt: true,
          },
        }),
      ])
      return {
        average: stats._avg.rating,
        count: stats._count._all,
        reviews: reviews.map((review) => ({
          ...review,
          createdAt: review.createdAt.toISOString(),
        })),
      }
    },
    ["event-reviews", eventId],
    { revalidate: 86400, tags: ["reviews"] }
  )()
