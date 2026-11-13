"use server"

import { revalidatePath, updateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { revalidatePublic } from "@/lib/revalidate-public"
import { associationSchema, type AssociationInput } from "@/lib/schemas/community"
import { fetchPublicPage } from "@/lib/events/fetch-public-page"
import { MAX_SOCIAL_LINKS, extractSocialLinks, normalizeSocialUrl } from "@/lib/events/social-links"

export type CommunityActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

// Small batches keep each bulk request well under the server action timeout.
const BULK_BATCH = 6

export const getEventCommunity = async (eventId: string) => {
  await requireRole("EDITOR")
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      website: true,
      socialLinks: true,
      socialLinksCheckedAt: true,
      associations: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        select: { id: true, name: true, url: true, logo: true },
      },
    },
  })
  if (!event) return null
  return { ...event, socialLinksCheckedAt: event.socialLinksCheckedAt?.toISOString() ?? null }
}

export type EventCommunity = NonNullable<Awaited<ReturnType<typeof getEventCommunity>>>

const revalidateEvent = async (eventId: string) => {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } })
  updateTag("events")
  if (event) revalidatePublic(`/evenement/${event.slug}`)
  revalidatePath(`/[locale]/admin/events/${eventId}/edit`, "page")
}

/** Normalizes the links, drops exact duplicates and sets aside the unusable ones. */
const cleanSocialLinks = (urls: string[]) => {
  const valid: string[] = []
  const invalid: string[] = []
  for (const raw of urls) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const normalized = normalizeSocialUrl(trimmed)
    if (!normalized) invalid.push(trimmed)
    else if (!valid.includes(normalized)) valid.push(normalized)
  }
  return { valid, invalid }
}

export const saveSocialLinks = async (
  eventId: string,
  urls: string[]
): Promise<CommunityActionResult> => {
  try {
    await requireRole("EDITOR")
    if (!Array.isArray(urls) || urls.some((url) => typeof url !== "string")) {
      return { success: false, message: "Liens invalides." }
    }
    const { valid, invalid } = cleanSocialLinks(urls)
    if (invalid.length > 0) {
      return {
        success: false,
        message: "Certains liens ne sont pas des pages de réseaux sociaux reconnues.",
        errors: { socialLinks: invalid.map((url) => `Lien non reconnu : ${url}`) },
      }
    }
    if (valid.length > MAX_SOCIAL_LINKS) {
      return { success: false, message: `${MAX_SOCIAL_LINKS} réseaux au maximum.` }
    }
    await prisma.event.update({ where: { id: eventId }, data: { socialLinks: valid } })
    await revalidateEvent(eventId)
    return { success: true, message: "Réseaux sociaux enregistrés." }
  } catch {
    return { success: false, message: "Impossible d'enregistrer les réseaux sociaux." }
  }
}

const searchWebsite = async (website: string) => {
  try {
    const page = await fetchPublicPage(website)
    return page ? extractSocialLinks(page.html, page.url) : []
  } catch {
    return []
  }
}

export type SocialSearchResult = CommunityActionResult & { links?: string[] }

/** Looks for social pages on the official website; suggestions are not saved. */
export const findSocialLinks = async (eventId: string): Promise<SocialSearchResult> => {
  try {
    await requireRole("EDITOR")
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { website: true },
    })
    if (!event) return { success: false, message: "Site introuvable." }
    if (!event.website) {
      return { success: false, message: "Aucun site officiel n'est renseigné pour ce lieu." }
    }
    const links = await searchWebsite(event.website)
    await prisma.event.update({
      where: { id: eventId },
      data: { socialLinksCheckedAt: new Date() },
    })
    return links.length > 0
      ? {
          success: true,
          message: `${links.length} réseau${links.length > 1 ? "x trouvés" : " trouvé"} sur le site officiel. Vérifiez puis enregistrez.`,
          links,
        }
      : { success: true, message: "Aucun réseau social trouvé sur le site officiel.", links: [] }
  } catch {
    return { success: false, message: "La recherche a échoué." }
  }
}

export type BulkSocialResult = CommunityActionResult & {
  processed: number
  found: number
  remaining: number
}

const bulkCandidatesWhere = {
  website: { not: null },
  socialLinks: { isEmpty: true },
  socialLinksCheckedAt: null,
}

/**
 * Searches a small batch of sites that have an official website, no social
 * page yet and were never searched. The client calls it again while
 * `remaining` is positive. Found pages are saved directly.
 */
export const findMissingSocialLinks = async (): Promise<BulkSocialResult> => {
  try {
    await requireRole("EDITOR")
    const events = await prisma.event.findMany({
      where: bulkCandidatesWhere,
      select: { id: true, slug: true, website: true },
      orderBy: { createdAt: "asc" },
      take: BULK_BATCH,
    })
    const results = await Promise.all(
      events.map(async (event) => ({
        event,
        links: event.website ? await searchWebsite(event.website) : [],
      }))
    )
    const checkedAt = new Date()
    await prisma.$transaction(
      results.map(({ event, links }) =>
        prisma.event.update({
          where: { id: event.id },
          data: {
            socialLinksCheckedAt: checkedAt,
            ...(links.length > 0 ? { socialLinks: links } : {}),
          },
        })
      )
    )
    const updated = results.filter(({ links }) => links.length > 0)
    if (updated.length > 0) {
      updateTag("events")
      for (const { event } of updated) revalidatePublic(`/evenement/${event.slug}`)
    }
    const remaining = await prisma.event.count({ where: bulkCandidatesWhere })
    return {
      success: true,
      message: `${events.length} site${events.length > 1 ? "s" : ""} analysé${events.length > 1 ? "s" : ""}.`,
      processed: events.length,
      found: updated.length,
      remaining,
    }
  } catch {
    return {
      success: false,
      message: "La recherche groupée a échoué.",
      processed: 0,
      found: 0,
      remaining: 0,
    }
  }
}

export const countMissingSocialLinks = async () => {
  await requireRole("EDITOR")
  return prisma.event.count({ where: bulkCandidatesWhere })
}

const parseAssociation = (input: AssociationInput) => {
  const result = associationSchema.safeParse(input)
  if (!result.success) {
    return {
      error: {
        success: false,
        message: "Veuillez corriger les erreurs du formulaire.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      } satisfies CommunityActionResult,
    }
  }
  return {
    data: {
      name: result.data.name,
      url: result.data.url || null,
      logo: result.data.logo || null,
    },
  }
}

export const addAssociation = async (
  eventId: string,
  input: AssociationInput
): Promise<CommunityActionResult> => {
  try {
    await requireRole("EDITOR")
    const parsed = parseAssociation(input)
    if (parsed.error) return parsed.error
    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } })
    if (!event) return { success: false, message: "Site introuvable." }
    const last = await prisma.eventAssociation.findFirst({
      where: { eventId },
      orderBy: { order: "desc" },
      select: { order: true },
    })
    await prisma.eventAssociation.create({
      data: { ...parsed.data, eventId, order: (last?.order ?? -1) + 1 },
    })
    await revalidateEvent(eventId)
    return { success: true, message: "Association ajoutée." }
  } catch {
    return { success: false, message: "Impossible d'ajouter l'association." }
  }
}

export const updateAssociation = async (
  id: string,
  input: AssociationInput
): Promise<CommunityActionResult> => {
  try {
    await requireRole("EDITOR")
    const parsed = parseAssociation(input)
    if (parsed.error) return parsed.error
    const association = await prisma.eventAssociation.update({
      where: { id },
      data: parsed.data,
      select: { eventId: true },
    })
    await revalidateEvent(association.eventId)
    return { success: true, message: "Association mise à jour." }
  } catch {
    return { success: false, message: "Impossible de mettre à jour l'association." }
  }
}

export const deleteAssociation = async (id: string): Promise<CommunityActionResult> => {
  try {
    await requireRole("EDITOR")
    const association = await prisma.eventAssociation.delete({
      where: { id },
      select: { eventId: true },
    })
    await revalidateEvent(association.eventId)
    return { success: true, message: "Association retirée." }
  } catch {
    return { success: false, message: "Impossible de retirer l'association." }
  }
}
