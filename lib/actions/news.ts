"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { newsSchema } from "@/lib/schemas/news"

export type NewsActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  newsId?: string
}

export const getAdminNews = async (search?: string) => {
  const where = search
    ? {
        OR: [
          { titleFr: { contains: search, mode: "insensitive" as const } },
          { excerptFr: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {}

  return prisma.news.findMany({
    where,
    orderBy: { publishedAt: "desc" },
    select: {
      id: true,
      titleFr: true,
      slug: true,
      excerptFr: true,
      coverImage: true,
      published: true,
      publishedAt: true,
    },
  })
}

export type AdminNewsListItem = Awaited<ReturnType<typeof getAdminNews>>[number]

export const getAdminNewsById = async (id: string) => {
  return prisma.news.findUnique({ where: { id } })
}

export const createNews = async (formData: FormData): Promise<NewsActionResult> => {
  try {
    const raw = extractNewsFormData(formData)
    const result = newsSchema.safeParse(raw)

    if (!result.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs dans le formulaire.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const data = result.data

    const existing = await prisma.news.findUnique({ where: { slug: data.slug } })
    if (existing) {
      return {
        success: false,
        message: "Ce slug est déjà utilisé par un autre article.",
        errors: { slug: ["Ce slug est déjà utilisé"] },
      }
    }

    const news = await prisma.news.create({
      data: {
        titleFr: data.titleFr,
        titleEn: data.titleEn || null,
        slug: data.slug,
        contentFr: data.contentFr,
        contentEn: data.contentEn || null,
        excerptFr: data.excerptFr || null,
        excerptEn: data.excerptEn || null,
        coverImage: data.coverImage || null,
        published: data.published,
        publishedAt: new Date(data.publishedAt),
      },
    })

    revalidatePath("/actualites")
    revalidatePath(`/actualite/${news.slug}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Article créé avec succès.",
      newsId: news.id,
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la création de l'article.",
    }
  }
}

export const updateNews = async (
  id: string,
  formData: FormData
): Promise<NewsActionResult> => {
  try {
    const raw = extractNewsFormData(formData)
    const result = newsSchema.safeParse(raw)

    if (!result.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs dans le formulaire.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const data = result.data

    const existing = await prisma.news.findFirst({
      where: { slug: data.slug, id: { not: id } },
    })
    if (existing) {
      return {
        success: false,
        message: "Ce slug est déjà utilisé par un autre article.",
        errors: { slug: ["Ce slug est déjà utilisé"] },
      }
    }

    const news = await prisma.news.update({
      where: { id },
      data: {
        titleFr: data.titleFr,
        titleEn: data.titleEn || null,
        slug: data.slug,
        contentFr: data.contentFr,
        contentEn: data.contentEn || null,
        excerptFr: data.excerptFr || null,
        excerptEn: data.excerptEn || null,
        coverImage: data.coverImage || null,
        published: data.published,
        publishedAt: new Date(data.publishedAt),
      },
    })

    revalidatePath("/actualites")
    revalidatePath(`/actualite/${news.slug}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Article mis à jour avec succès.",
      newsId: news.id,
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour de l'article.",
    }
  }
}

export const deleteNews = async (id: string): Promise<NewsActionResult> => {
  try {
    const news = await prisma.news.delete({ where: { id } })

    revalidatePath("/actualites")
    revalidatePath(`/actualite/${news.slug}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Article supprimé avec succès.",
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression de l'article.",
    }
  }
}

const extractNewsFormData = (formData: FormData) => ({
  titleFr: (formData.get("titleFr") as string) ?? "",
  titleEn: (formData.get("titleEn") as string) ?? "",
  slug: (formData.get("slug") as string) ?? "",
  contentFr: (formData.get("contentFr") as string) ?? "",
  contentEn: (formData.get("contentEn") as string) ?? "",
  excerptFr: (formData.get("excerptFr") as string) ?? "",
  excerptEn: (formData.get("excerptEn") as string) ?? "",
  coverImage: (formData.get("coverImage") as string) ?? "",
  published: formData.get("published") !== "false",
  publishedAt: (formData.get("publishedAt") as string) ?? "",
})
