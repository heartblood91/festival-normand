"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { pageSchema } from "@/lib/schemas/page"

export type PageActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  pageId?: string
}

const SYSTEM_SLUGS = ["festival", "inscription", "mentions-legales"]

export const getAdminPages = async () => {
  return prisma.page.findMany({
    orderBy: { titleFr: "asc" },
    select: {
      id: true,
      titleFr: true,
      slug: true,
      updatedAt: true,
    },
  })
}

export type AdminPageListItem = Awaited<ReturnType<typeof getAdminPages>>[number]

export const getAdminPageById = async (id: string) => {
  return prisma.page.findUnique({ where: { id } })
}

export const createPage = async (formData: FormData): Promise<PageActionResult> => {
  try {
    const raw = extractPageFormData(formData)
    const result = pageSchema.safeParse(raw)

    if (!result.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs dans le formulaire.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const data = result.data

    const existing = await prisma.page.findUnique({ where: { slug: data.slug } })
    if (existing) {
      return {
        success: false,
        message: "Ce slug est déjà utilisé par une autre page.",
        errors: { slug: ["Ce slug est déjà utilisé"] },
      }
    }

    const page = await prisma.page.create({
      data: {
        titleFr: data.titleFr,
        titleEn: data.titleEn || null,
        slug: data.slug,
        contentFr: data.contentFr,
        contentEn: data.contentEn || null,
      },
    })

    revalidatePath(`/${page.slug}`)

    return {
      success: true,
      message: "Page créée avec succès.",
      pageId: page.id,
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la création de la page.",
    }
  }
}

export const updatePage = async (
  id: string,
  formData: FormData
): Promise<PageActionResult> => {
  try {
    const raw = extractPageFormData(formData)
    const result = pageSchema.safeParse(raw)

    if (!result.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs dans le formulaire.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }

    const data = result.data

    const existing = await prisma.page.findFirst({
      where: { slug: data.slug, id: { not: id } },
    })
    if (existing) {
      return {
        success: false,
        message: "Ce slug est déjà utilisé par une autre page.",
        errors: { slug: ["Ce slug est déjà utilisé"] },
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        titleFr: data.titleFr,
        titleEn: data.titleEn || null,
        slug: data.slug,
        contentFr: data.contentFr,
        contentEn: data.contentEn || null,
      },
    })

    revalidatePath(`/${page.slug}`)
    revalidatePath("/")

    return {
      success: true,
      message: "Page mise à jour avec succès.",
      pageId: page.id,
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la mise à jour de la page.",
    }
  }
}

export const deletePage = async (id: string): Promise<PageActionResult> => {
  try {
    const page = await prisma.page.findUnique({ where: { id } })
    if (!page) {
      return {
        success: false,
        message: "Page introuvable.",
      }
    }

    if (SYSTEM_SLUGS.includes(page.slug)) {
      return {
        success: false,
        message: "Les pages système ne peuvent pas être supprimées.",
      }
    }

    await prisma.page.delete({ where: { id } })

    revalidatePath(`/${page.slug}`)

    return {
      success: true,
      message: "Page supprimée avec succès.",
    }
  } catch {
    return {
      success: false,
      message: "Une erreur est survenue lors de la suppression de la page.",
    }
  }
}

const extractPageFormData = (formData: FormData) => ({
  titleFr: (formData.get("titleFr") as string) ?? "",
  titleEn: (formData.get("titleEn") as string) ?? "",
  slug: (formData.get("slug") as string) ?? "",
  contentFr: (formData.get("contentFr") as string) ?? "",
  contentEn: (formData.get("contentEn") as string) ?? "",
})
