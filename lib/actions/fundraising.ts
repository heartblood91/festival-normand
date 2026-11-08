"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { isFundraisingImageUrl, isFundraisingUrl } from "@/lib/fundraising/fondation"

export type FundraisingFields = { url: string; title: string; image: string | null }

export type FundraisingActionResult = {
  success: boolean
  message: string
  fundraising?: FundraisingFields
}

export const getFundraisingSuggestions = async (eventId: string) => {
  await requireRole("EDITOR")
  // "commune" sorts before "distance": same-town collects come first.
  return prisma.fundraisingSuggestion.findMany({
    where: { eventId, status: { not: "REJECTED" } },
    orderBy: [{ reason: "asc" }, { distanceKm: { sort: "asc", nulls: "last" } }],
    select: {
      id: true,
      url: true,
      title: true,
      city: true,
      imageUrl: true,
      reason: true,
      distanceKm: true,
      collectedPercent: true,
      status: true,
    },
  })
}

export type FundraisingSuggestionItem = Awaited<
  ReturnType<typeof getFundraisingSuggestions>
>[number]

export const attachFundraisingSuggestion = async (id: string): Promise<FundraisingActionResult> => {
  try {
    await requireRole("EDITOR")
    const suggestion = await prisma.fundraisingSuggestion.findUnique({
      where: { id },
      select: {
        id: true,
        eventId: true,
        url: true,
        title: true,
        imageUrl: true,
        status: true,
        event: { select: { slug: true } },
      },
    })
    if (!suggestion || suggestion.status === "REJECTED" || !isFundraisingUrl(suggestion.url)) {
      return { success: false, message: "Cette collecte ne peut pas être associée." }
    }

    const fundraising = {
      url: suggestion.url,
      title: suggestion.title,
      image:
        suggestion.imageUrl && isFundraisingImageUrl(suggestion.imageUrl)
          ? suggestion.imageUrl
          : null,
    }
    await prisma.$transaction([
      prisma.event.update({
        where: { id: suggestion.eventId },
        data: {
          fundraisingUrl: fundraising.url,
          fundraisingTitle: fundraising.title,
          fundraisingImage: fundraising.image,
        },
      }),
      prisma.fundraisingSuggestion.update({
        where: { id: suggestion.id },
        data: { status: "ACCEPTED" },
      }),
    ])
    revalidatePath(`/evenement/${suggestion.event.slug}`)
    revalidatePath("/evenements")

    return { success: true, message: "Collecte associée à l'événement.", fundraising }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de l'association." }
  }
}

export const dismissFundraisingSuggestion = async (
  id: string
): Promise<FundraisingActionResult> => {
  try {
    await requireRole("EDITOR")
    await prisma.fundraisingSuggestion.update({ where: { id }, data: { status: "REJECTED" } })
    return { success: true, message: "Suggestion ignorée." }
  } catch {
    return { success: false, message: "Une erreur est survenue." }
  }
}
