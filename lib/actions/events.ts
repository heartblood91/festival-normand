"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { eventSchema } from "@/lib/schemas/event"
import { searchEventIds } from "@/lib/search"
import type { Category, Department, Prisma } from "@prisma/client"

export type EventActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  eventId?: string
}

type GetAdminEventsParams = {
  search?: string
  page?: number
  limit?: number
  status?: "published" | "draft" | "depublished" | "all"
  department?: string
  category?: string
  featured?: string
}

import type { AdminEventListItem } from "@/lib/types/admin"

type GetAdminEventsResult = {
  items: AdminEventListItem[]
  total: number
  page: number
  totalPages: number
}

export const getAdminEvents = async ({
  search,
  page = 1,
  limit = 25,
  status = "all",
  department,
  category,
  featured,
}: GetAdminEventsParams = {}): Promise<GetAdminEventsResult> => {
  const where: Prisma.EventWhereInput = {}

  if (search) {
    const matchedIds = await searchEventIds(search)
    where.id = { in: matchedIds }
  }

  if (status === "published") {
    where.published = true
  } else if (status === "draft") {
    where.published = false
    where.publishedAt = null
    where.unpublishedAt = null
  } else if (status === "depublished") {
    where.published = false
    where.unpublishedAt = { not: null }
  }

  if (department && department !== "all") {
    where.department = department as Department
  }

  if (category && category !== "all") {
    where.category = category as Category
  }

  if (featured === "true") {
    where.featured = true
  } else if (featured === "false") {
    where.featured = false
  }

  const total = await prisma.event.count({ where })
  const totalPages = Math.ceil(total / limit)
  const skip = (page - 1) * limit

  const items = await prisma.event.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip,
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
    },
  })

  return { items, total, page, totalPages }
}

export const getAdminEventById = async (id: string) => {
  return prisma.event.findUnique({ where: { id } })
}

export const createEvent = async (formData: FormData): Promise<EventActionResult> => {
  try {
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

export const deleteEvent = async (id: string): Promise<EventActionResult> => {
  try {
    const event = await prisma.event.delete({ where: { id } })

    revalidatePath("/evenements")
    revalidatePath(`/evenement/${event.slug}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Événement supprimé avec succès.",
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression de l'événement.",
    }
  }
}

export const bulkDeleteEvents = async (ids: string[]): Promise<EventActionResult> => {
  try {
    if (!ids.length) {
      return {
        success: false,
        message: "Aucun événement sélectionné.",
      }
    }

    const events = await prisma.event.findMany({
      where: { id: { in: ids } },
      select: { slug: true },
    })

    await prisma.event.deleteMany({
      where: { id: { in: ids } },
    })

    revalidatePath("/evenements")
    events.forEach((event) => {
      revalidatePath(`/evenement/${event.slug}`)
    })
    revalidatePath("/")

    return {
      success: true,
      message: `${ids.length} événement${ids.length > 1 ? "s" : ""} supprimé${ids.length > 1 ? "s" : ""} avec succès.`,
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression des événements.",
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
  featured: formData.get("featured") === "true",
  accessible: formData.get("accessible") === "true",
  published: formData.get("published") !== "false",
})
