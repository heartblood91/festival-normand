"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { eventSchema } from "@/lib/schemas/event"
import { searchEventIds } from "@/lib/search"
import type { AdminEventListItem } from "@/lib/types/admin"
import {
  eventListOrderBy,
  eventListWhere,
  parisToday,
  publishBlocker,
  type EventListParams,
} from "@/lib/admin/event-list"
import type { Category, Department } from "@prisma/client"

export type EventActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  eventId?: string
}

type GetAdminEventsParams = EventListParams & { limit?: number }

type GetAdminEventsResult = {
  items: AdminEventListItem[]
  total: number
  page: number
  totalPages: number
}

export const getAdminEvents = async ({
  limit = 25,
  ...params
}: GetAdminEventsParams = {}): Promise<GetAdminEventsResult> => {
  await requireRole("EDITOR")

  const page = params.page ?? 1
  const searchIds = params.search ? await searchEventIds(params.search) : undefined
  const where = eventListWhere(params, parisToday(), searchIds)

  const total = await prisma.event.count({ where })
  const totalPages = Math.ceil(total / limit)

  const items = await prisma.event.findMany({
    where,
    orderBy: eventListOrderBy(params.sort),
    skip: (page - 1) * limit,
    take: limit,
    select: {
      id: true,
      titleFr: true,
      slug: true,
      city: true,
      department: true,
      category: true,
      dateStart: true,
      featured: true,
      published: true,
      publishedAt: true,
      unpublishedAt: true,
      accessible: true,
      tourinsoftId: true,
      tourinsoftUpdatedAt: true,
    },
  })

  return { items, total, page, totalPages }
}

export const getAdminEventById = async (id: string) => {
  await requireRole("EDITOR")
  return prisma.event.findUnique({ where: { id } })
}

export const createEvent = async (formData: FormData): Promise<EventActionResult> => {
  try {
    await requireRole("EDITOR")
    const raw = extractFormData(formData)
    const result = eventSchema.safeParse(raw)

    if (!result.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs dans le formulaire.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const data = result.data

    // Check slug uniqueness
    const existing = await prisma.event.findUnique({ where: { slug: data.slug } })
    if (existing) {
      return {
        success: false,
        message: "Ce slug est déjà utilisé par un autre événement.",
        errors: { slug: ["Ce slug est déjà utilisé"] },
      }
    }

    const event = await prisma.event.create({
      data: {
        titleFr: data.titleFr,
        titleEn: data.titleEn || null,
        slug: data.slug,
        descriptionFr: data.descriptionFr,
        descriptionEn: data.descriptionEn || null,
        location: data.location,
        city: data.city,
        postalCode: data.postalCode,
        department: data.department as Department,
        category: data.category as Category,
        dateStart: new Date(data.dateStart),
        dateEnd: data.dateEnd ? new Date(data.dateEnd) : null,
        timeStart: data.timeStart || null,
        timeEnd: data.timeEnd || null,
        pricingFr: data.pricingFr || null,
        pricingEn: data.pricingEn || null,
        organizer: data.organizer || null,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        coverImage: data.coverImage || null,
        coverImageAltFr: data.coverImageAltFr?.trim() || null,
        coverImageAltEn: data.coverImageAltEn?.trim() || null,
        featured: data.featured,
        accessible: data.accessible,
        published: data.published,
        publishedAt: data.published ? new Date() : null,
      },
    })

    revalidatePath("/evenements")
    revalidatePath(`/evenement/${event.slug}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Événement créé avec succès.",
      eventId: event.id,
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la création de l'événement.",
    }
  }
}

export const updateEvent = async (id: string, formData: FormData): Promise<EventActionResult> => {
  try {
    await requireRole("EDITOR")
    const raw = extractFormData(formData)
    const result = eventSchema.safeParse(raw)

    if (!result.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs dans le formulaire.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const data = result.data

    // Check slug uniqueness (exclude current event)
    const existing = await prisma.event.findFirst({
      where: { slug: data.slug, id: { not: id } },
    })
    if (existing) {
      return {
        success: false,
        message: "Ce slug est déjà utilisé par un autre événement.",
        errors: { slug: ["Ce slug est déjà utilisé"] },
      }
    }

    // Check if publishing state changed
    const current = await prisma.event.findUnique({ where: { id }, select: { published: true } })
    const isPublishing = !current?.published && data.published
    const isUnpublishing = current?.published && !data.published

    const event = await prisma.event.update({
      where: { id },
      data: {
        titleFr: data.titleFr,
        titleEn: data.titleEn || null,
        slug: data.slug,
        descriptionFr: data.descriptionFr,
        descriptionEn: data.descriptionEn || null,
        location: data.location,
        city: data.city,
        postalCode: data.postalCode,
        department: data.department as Department,
        category: data.category as Category,
        dateStart: new Date(data.dateStart),
        dateEnd: data.dateEnd ? new Date(data.dateEnd) : null,
        timeStart: data.timeStart || null,
        timeEnd: data.timeEnd || null,
        pricingFr: data.pricingFr || null,
        pricingEn: data.pricingEn || null,
        organizer: data.organizer || null,
        email: data.email || null,
        phone: data.phone || null,
        website: data.website || null,
        latitude: data.latitude ?? null,
        longitude: data.longitude ?? null,
        coverImage: data.coverImage || null,
        coverImageAltFr: data.coverImageAltFr?.trim() || null,
        coverImageAltEn: data.coverImageAltEn?.trim() || null,
        featured: data.featured,
        accessible: data.accessible,
        published: data.published,
        ...(isPublishing ? { publishedAt: new Date(), unpublishedAt: null } : {}),
        ...(isUnpublishing ? { unpublishedAt: new Date() } : {}),
      },
    })

    revalidatePath("/evenements")
    revalidatePath(`/evenement/${event.slug}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Événement mis à jour avec succès.",
      eventId: event.id,
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour de l'événement.",
    }
  }
}

// Events are never deleted, only unpublished: the row, its URL history and the
// Tourinsoft link stay, so the sync cannot recreate it and editors can undo.
export const unpublishEvents = async (ids: string[]): Promise<EventActionResult> => {
  try {
    await requireRole("EDITOR")
    if (!ids.length) {
      return { success: false, message: "Aucun événement sélectionné." }
    }

    const events = await prisma.event.findMany({
      where: { id: { in: ids }, published: true },
      select: { slug: true },
    })
    const { count } = await prisma.event.updateMany({
      where: { id: { in: ids }, published: true },
      data: { published: false, unpublishedAt: new Date() },
    })

    revalidatePath("/evenements")
    events.forEach((event) => revalidatePath(`/evenement/${event.slug}`))
    revalidatePath("/")

    return {
      success: true,
      message: count > 1 ? `${count} événements dépubliés.` : `${count} événement dépublié.`,
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la dépublication.",
    }
  }
}

const extractFormData = (formData: FormData) => ({
  titleFr: (formData.get("titleFr") as string) ?? "",
  titleEn: (formData.get("titleEn") as string) ?? "",
  slug: (formData.get("slug") as string) ?? "",
  descriptionFr: (formData.get("descriptionFr") as string) ?? "",
  descriptionEn: (formData.get("descriptionEn") as string) ?? "",
  location: (formData.get("location") as string) ?? "",
  city: (formData.get("city") as string) ?? "",
  postalCode: (formData.get("postalCode") as string) ?? "",
  department: (formData.get("department") as string) ?? "",
  category: (formData.get("category") as string) ?? "",
  dateStart: (formData.get("dateStart") as string) ?? "",
  dateEnd: (formData.get("dateEnd") as string) ?? "",
  timeStart: (formData.get("timeStart") as string) ?? "",
  timeEnd: (formData.get("timeEnd") as string) ?? "",
  pricingFr: (formData.get("pricingFr") as string) ?? "",
  pricingEn: (formData.get("pricingEn") as string) ?? "",
  organizer: (formData.get("organizer") as string) ?? "",
  email: (formData.get("email") as string) ?? "",
  phone: (formData.get("phone") as string) ?? "",
  website: (formData.get("website") as string) ?? "",
  latitude: (formData.get("latitude") as string) ?? "",
  longitude: (formData.get("longitude") as string) ?? "",
  coverImage: (formData.get("coverImage") as string) ?? "",
  coverImageAltFr: (formData.get("coverImageAltFr") as string) ?? "",
  coverImageAltEn: (formData.get("coverImageAltEn") as string) ?? "",
  featured: formData.get("featured") === "true",
  accessible: formData.get("accessible") === "true",
  published: formData.get("published") !== "false",
})

const revalidateEvents = (slugs: string[]) => {
  revalidatePath("/evenements")
  slugs.forEach((slug) => revalidatePath(`/evenement/${slug}`))
  revalidatePath("/")
}

const plural = (count: number, one: string, many: string) => `${count} ${count > 1 ? many : one}`

/**
 * Bulk publish skips the AI review but never the RGAA alt rule: blocked drafts
 * stay unpublished and are named in the message.
 */
export const publishEvents = async (ids: string[]): Promise<EventActionResult> => {
  try {
    await requireRole("EDITOR")
    if (!ids.length) return { success: false, message: "Aucun événement sélectionné." }

    const drafts = await prisma.event.findMany({
      where: { id: { in: ids }, published: false },
      select: {
        id: true,
        slug: true,
        titleFr: true,
        coverImage: true,
        coverImageAltFr: true,
        descriptionFr: true,
        descriptionEn: true,
      },
    })
    const blocked = drafts.flatMap((event) => {
      const reason = publishBlocker(event)
      return reason ? [`${event.titleFr} (${reason})`] : []
    })
    const ready = drafts.filter((event) => !publishBlocker(event))
    const skipped = blocked.length ? ` Non publié(s) : ${blocked.join(", ")}.` : ""

    if (!ready.length) {
      return { success: false, message: `Aucun événement publié.${skipped}` }
    }

    const { count } = await prisma.event.updateMany({
      where: { id: { in: ready.map((event) => event.id) }, published: false },
      data: { published: true, publishedAt: new Date(), unpublishedAt: null },
    })
    revalidateEvents(ready.map((event) => event.slug))

    return {
      success: true,
      message: `${plural(count, "événement publié", "événements publiés")}.${skipped}`,
    }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de la publication." }
  }
}

export const setEventsFeatured = async (
  ids: string[],
  featured: boolean
): Promise<EventActionResult> => {
  try {
    await requireRole("EDITOR")
    if (!ids.length) return { success: false, message: "Aucun événement sélectionné." }

    const events = await prisma.event.findMany({
      where: { id: { in: ids } },
      select: { slug: true },
    })
    const { count } = await prisma.event.updateMany({
      where: { id: { in: ids } },
      data: { featured },
    })
    revalidateEvents(events.map((event) => event.slug))

    return {
      success: true,
      message: featured
        ? `${plural(count, "événement mis", "événements mis")} à la une.`
        : `${plural(count, "événement retiré", "événements retirés")} de la une.`,
    }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de la mise à jour." }
  }
}
