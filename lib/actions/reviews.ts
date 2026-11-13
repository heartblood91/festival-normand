"use server"

import { revalidatePath, updateTag } from "next/cache"
import type { ReviewStatus } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { revalidatePublic } from "@/lib/revalidate-public"
import { isAiConfigured } from "@/lib/ai/openrouter"
import { adviseOnReview } from "@/lib/reviews/advise"

export type ReviewActionResult = { success: boolean; message: string }

export type ReviewFilter = "PENDING" | "APPROVED" | "REJECTED"

const REVIEW_STATUSES: ReviewFilter[] = ["PENDING", "APPROVED", "REJECTED"]
const ADMIN_PAGE_SIZE = 100

export const getAdminReviews = async (status: ReviewFilter) => {
  await requireRole("EDITOR")
  const [reviews, counts] = await Promise.all([
    prisma.eventReview.findMany({
      where: { status },
      // Oldest first while pending (a queue), newest first once decided.
      orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
      take: ADMIN_PAGE_SIZE,
      select: {
        id: true,
        authorName: true,
        rating: true,
        comment: true,
        locale: true,
        status: true,
        aiVerdict: true,
        aiReason: true,
        createdAt: true,
        moderatedAt: true,
        event: { select: { titleFr: true, slug: true } },
      },
    }),
    prisma.eventReview.groupBy({ by: ["status"], _count: { _all: true } }),
  ])
  const totals = Object.fromEntries(REVIEW_STATUSES.map((s) => [s, 0])) as Record<
    ReviewFilter,
    number
  >
  for (const row of counts) totals[row.status] = row._count._all
  return { reviews, totals, aiConfigured: isAiConfigured() }
}

export type AdminReviews = Awaited<ReturnType<typeof getAdminReviews>>
export type AdminReview = AdminReviews["reviews"][number]

const revalidateReviews = (slug: string) => {
  updateTag("reviews")
  revalidatePublic(`/evenement/${slug}`)
  revalidatePath("/[locale]/admin/reviews", "page")
}

export const setReviewStatus = async (
  id: string,
  status: ReviewStatus
): Promise<ReviewActionResult> => {
  try {
    await requireRole("EDITOR")
    if (!REVIEW_STATUSES.includes(status)) return { success: false, message: "Statut invalide." }
    const review = await prisma.eventReview.update({
      where: { id },
      data: { status, moderatedAt: status === "PENDING" ? null : new Date() },
      select: { event: { select: { slug: true } } },
    })
    revalidateReviews(review.event.slug)
    return {
      success: true,
      message:
        status === "APPROVED"
          ? "Avis publié."
          : status === "REJECTED"
            ? "Avis refusé."
            : "Avis remis en attente.",
    }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de la mise à jour." }
  }
}

export const deleteReview = async (id: string): Promise<ReviewActionResult> => {
  try {
    await requireRole("EDITOR")
    const review = await prisma.eventReview.delete({
      where: { id },
      select: { event: { select: { slug: true } } },
    })
    revalidateReviews(review.event.slug)
    return { success: true, message: "Avis supprimé." }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de la suppression." }
  }
}

/** Asks the model again, e.g. for reviews sent before the key was configured. */
export const requestReviewAdvice = async (id: string): Promise<ReviewActionResult> => {
  try {
    await requireRole("EDITOR")
    if (!isAiConfigured()) {
      return { success: false, message: "La clé OpenRouter n'est pas configurée." }
    }
    const advised = await adviseOnReview(id)
    revalidatePath("/[locale]/admin/reviews", "page")
    return advised
      ? { success: true, message: "Avis de l'IA mis à jour." }
      : { success: false, message: "L'IA n'a pas pu analyser cet avis. Réessayez plus tard." }
  } catch {
    return { success: false, message: "Une erreur est survenue." }
  }
}
