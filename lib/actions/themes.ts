"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { themeSchema } from "@/lib/schemas/theme"

export type ThemeActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  themeId?: string
}

const INVALID_FORM = "Veuillez corriger les erreurs dans le formulaire."

export const getAdminThemes = async () => {
  await requireRole("EDITOR")
  return prisma.theme.findMany({
    orderBy: [{ order: "asc" }, { nameFr: "asc" }],
    select: {
      id: true,
      slug: true,
      nameFr: true,
      color: true,
      markerImage: true,
      showOnHome: true,
      order: true,
      _count: { select: { events: true } },
    },
  })
}

export type AdminThemeListItem = Awaited<ReturnType<typeof getAdminThemes>>[number]

export const getAdminThemeById = async (id: string) => {
  await requireRole("EDITOR")
  return prisma.theme.findUnique({ where: { id } })
}

/** Options of the theme picker in the event form. */
export const getThemeOptions = async () => {
  await requireRole("EDITOR")
  return prisma.theme.findMany({
    orderBy: [{ order: "asc" }, { nameFr: "asc" }],
    select: { id: true, nameFr: true, color: true },
  })
}

export type ThemeOption = Awaited<ReturnType<typeof getThemeOptions>>[number]

const extractThemeFormData = (formData: FormData) => ({
  nameFr: (formData.get("nameFr") as string) ?? "",
  nameEn: (formData.get("nameEn") as string) ?? "",
  slug: (formData.get("slug") as string) ?? "",
  descriptionFr: (formData.get("descriptionFr") as string) ?? "",
  descriptionEn: (formData.get("descriptionEn") as string) ?? "",
  color: (formData.get("color") as string) ?? "",
  markerImage: (formData.get("markerImage") as string) ?? "",
  showOnHome: formData.get("showOnHome") === "true",
  order: (formData.get("order") as string) || "0",
})

const parseTheme = async (formData: FormData, id?: string) => {
  const result = themeSchema.safeParse(extractThemeFormData(formData))
  if (!result.success) {
    return {
      error: {
        success: false,
        message: INVALID_FORM,
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      },
    }
  }
  const data = result.data
  const taken = await prisma.theme.findFirst({
    where: { slug: data.slug, ...(id ? { id: { not: id } } : {}) },
    select: { id: true },
  })
  if (taken) {
    return {
      error: {
        success: false,
        message: "Ce slug est déjà utilisé par une autre thématique.",
        errors: { slug: ["Ce slug est déjà utilisé"] },
      },
    }
  }
  return {
    data: {
      nameFr: data.nameFr,
      nameEn: data.nameEn?.trim() || null,
      slug: data.slug,
      descriptionFr: data.descriptionFr?.trim() || null,
      descriptionEn: data.descriptionEn?.trim() || null,
      color: data.color.toLowerCase(),
      markerImage: data.markerImage || null,
      showOnHome: data.showOnHome,
      order: data.order,
    },
  }
}

const revalidateThemes = () => {
  revalidatePath("/", "layout")
}

export const createTheme = async (formData: FormData): Promise<ThemeActionResult> => {
  try {
    await requireRole("EDITOR")
    const parsed = await parseTheme(formData)
    if (parsed.error) return parsed.error

    const theme = await prisma.theme.create({ data: parsed.data })
    revalidateThemes()
    return { success: true, message: "Thématique créée.", themeId: theme.id }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de la création." }
  }
}

export const updateTheme = async (id: string, formData: FormData): Promise<ThemeActionResult> => {
  try {
    await requireRole("EDITOR")
    const parsed = await parseTheme(formData, id)
    if (parsed.error) return parsed.error

    await prisma.theme.update({ where: { id }, data: parsed.data })
    revalidateThemes()
    return { success: true, message: "Thématique mise à jour.", themeId: id }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de la mise à jour." }
  }
}

/** Removes the theme and its links; the events themselves are untouched. */
export const deleteTheme = async (id: string): Promise<ThemeActionResult> => {
  try {
    await requireRole("EDITOR")
    await prisma.theme.delete({ where: { id } })
    revalidateThemes()
    return { success: true, message: "Thématique supprimée. Les événements sont conservés." }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de la suppression." }
  }
}
