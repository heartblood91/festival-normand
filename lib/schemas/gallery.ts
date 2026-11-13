import { z } from "zod"
import { imageUrlSchema } from "@/lib/schemas/image-url"

export const GALLERY_MIN_YEAR = 2000
export const GALLERY_MAX_YEAR = 2100
export const MAX_GALLERY_UPLOADS = 30

export const galleryYearSchema = z.coerce
  .number()
  .int()
  .min(GALLERY_MIN_YEAR, "Année invalide")
  .max(GALLERY_MAX_YEAR, "Année invalide")

export const galleryAddSchema = z.object({
  year: galleryYearSchema,
  urls: z.array(imageUrlSchema).min(1).max(MAX_GALLERY_UPLOADS),
})

export const galleryPhotoSchema = z.object({
  altFr: z
    .string()
    .trim()
    .min(5, "Le texte alternatif doit faire au moins 5 caractères")
    .max(250, "250 caractères maximum"),
  altEn: z.string().trim().max(250, "250 caractères maximum"),
  credit: z.string().trim().max(120, "120 caractères maximum"),
  year: galleryYearSchema,
})

export type GalleryPhotoInput = z.input<typeof galleryPhotoSchema>
