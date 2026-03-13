"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { eventSchema } from "@/lib/schemas/event"
import type { Category, Department } from "@prisma/client"

export type EventActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  eventId?: string
}

export const getAdminEvents = async (search?: string) => {
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { city: { contains: search, mode: "insensitive" as const } },
          { location: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {}

  return prisma.event.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      city: true,
      department: true,
      category: true,
      dateStart: true,
      featured: true,
      published: true,
      accessible: true,
    },
  })
}

export type AdminEventListItem = Awaited<ReturnType<typeof getAdminEvents>>[number]

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
        title: data.title,
        slug: data.slug,
        description: data.description,
        location: data.location,
        city: data.city,
        postalCode: data.postalCode,
        department: data.department as Department,
        category: data.category as Category,
        dateStart: new Date(data.dateStart),
        dateEnd: data.dateEnd ? new Date(data.dateEnd) : null,
        timeStart: data.timeStart || null,
        timeEnd: data.timeEnd || null,
        pricing: data.pricing || null,
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

export const updateEvent = async (
  id: string,
  formData: FormData
): Promise<EventActionResult> => {
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

    const event = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        location: data.location,
        city: data.city,
        postalCode: data.postalCode,
        department: data.department as Department,
        category: data.category as Category,
        dateStart: new Date(data.dateStart),
        dateEnd: data.dateEnd ? new Date(data.dateEnd) : null,
        timeStart: data.timeStart || null,
        timeEnd: data.timeEnd || null,
        pricing: data.pricing || null,
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

const extractFormData = (formData: FormData) => ({
  title: (formData.get("title") as string) ?? "",
  slug: (formData.get("slug") as string) ?? "",
  description: (formData.get("description") as string) ?? "",
  location: (formData.get("location") as string) ?? "",
  city: (formData.get("city") as string) ?? "",
  postalCode: (formData.get("postalCode") as string) ?? "",
  department: (formData.get("department") as string) ?? "",
  category: (formData.get("category") as string) ?? "",
  dateStart: (formData.get("dateStart") as string) ?? "",
  dateEnd: (formData.get("dateEnd") as string) ?? "",
  timeStart: (formData.get("timeStart") as string) ?? "",
  timeEnd: (formData.get("timeEnd") as string) ?? "",
  pricing: (formData.get("pricing") as string) ?? "",
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
