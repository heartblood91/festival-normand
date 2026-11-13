import { z } from "zod"
import { imageUrlSchema } from "@/lib/schemas/image-url"

export const associationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(120, "Le nom ne peut pas dépasser 120 caractères"),
  url: z
    .string()
    .trim()
    .max(500)
    .refine(
      (value) => !value || /^https?:\/\/[^\s/]+\.[^\s]+$/.test(value),
      "Le lien doit être une adresse web complète (https://…)"
    ),
  logo: z.union([z.literal(""), imageUrlSchema]),
})

export type AssociationInput = z.infer<typeof associationSchema>
