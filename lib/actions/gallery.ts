"use server"

import { revalidatePath, updateTag } from "next/cache"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { revalidatePublic } from "@/lib/revalidate-public"
import { galleryAddSchema, galleryPhotoSchema, type GalleryPhotoInput } from "@/lib/schemas/gallery"

export type GalleryActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
}

export const getAdminGallery = async () => {
  await requireRole("EDITOR")
  return prisma.galleryPhoto.findMany({
    orderBy: [{ year: "desc" }, { order: "asc" }, { createdAt: "asc" }],
  })
}

export type AdminGalleryPhoto = Awaited<ReturnType<typeof getAdminGallery>>[number]

const revalidateGallery = () => {
  updateTag("gallery")
  revalidatePublic("/")
  revalidatePath("/[locale]/retour-en-images", "layout")
  revalidatePath("/[locale]/admin/gallery", "page")
}

/** Records freshly uploaded photos at the end of their year, without a text alternative yet. */
export const addGalleryPhotos = async (
  year: number,
  urls: string[]
): Promise<GalleryActionResult> => {
  try {
    await requireRole("EDITOR")
    const result = galleryAddSchema.safeParse({ year, urls })
    if (!result.success) return { success: false, message: "Photos invalides." }

    const last = await prisma.galleryPhoto.findFirst({
      where: { year: result.data.year },
      orderBy: { order: "desc" },
      select: { order: true },
    })
    const start = (last?.order ?? -1) + 1
    await prisma.galleryPhoto.createMany({
      data: result.data.urls.map((url, index) => ({
        url,
        year: result.data.year,
        order: start + index,
      })),
    })
    revalidateGallery()
    const count = result.data.urls.length
    return {
      success: true,
      message: `${count} photo${count > 1 ? "s ajoutées" : " ajoutée"}. Rédigez le texte alternatif pour la publier.`,
    }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de l'ajout des photos." }
  }
}

export const updateGalleryPhoto = async (
  id: string,
  input: GalleryPhotoInput
): Promise<GalleryActionResult> => {
  try {
    await requireRole("EDITOR")
    const result = galleryPhotoSchema.safeParse(input)
    if (!result.success) {
      return {
        success: false,
        message: "Veuillez corriger les erreurs.",
        errors: result.error.flatten().fieldErrors as Record<string, string[]>,
      }
    }
    const { altFr, altEn, credit, year } = result.data
    const current = await prisma.galleryPhoto.findUnique({ where: { id }, select: { year: true } })
    if (!current) return { success: false, message: "Photo introuvable." }

    // Moving a photo to another year puts it at the end of that year.
    const order =
      current.year === year
        ? undefined
        : ((
            await prisma.galleryPhoto.findFirst({
              where: { year },
              orderBy: { order: "desc" },
              select: { order: true },
            })
          )?.order ?? -1) + 1
    await prisma.galleryPhoto.update({
      where: { id },
      data: { altFr, altEn: altEn || null, credit: credit || null, year, order },
    })
    revalidateGallery()
    return { success: true, message: "Photo enregistrée." }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." }
  }
}

export const deleteGalleryPhoto = async (id: string): Promise<GalleryActionResult> => {
  try {
    await requireRole("EDITOR")
    await prisma.galleryPhoto.delete({ where: { id } })
    revalidateGallery()
    return { success: true, message: "Photo supprimée." }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de la suppression." }
  }
}

/** Saves the display order of one year's photos. */
export const reorderGalleryPhotos = async (
  year: number,
  orderedIds: string[]
): Promise<GalleryActionResult> => {
  try {
    await requireRole("EDITOR")
    await prisma.$transaction(
      orderedIds.map((id, index) =>
        prisma.galleryPhoto.updateMany({ where: { id, year }, data: { order: index } })
      )
    )
    revalidateGallery()
    return { success: true, message: "Ordre enregistré." }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de la réorganisation." }
  }
}
