import { z } from "zod"

export const newsSchema = z.object({
  title: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  slug: z
    .string()
    .min(3, "Le slug doit contenir au moins 3 caractères")
    .max(200, "Le slug ne peut pas dépasser 200 caractères")
    .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"),
  content: z
    .string()
    .min(10, "Le contenu doit contenir au moins 10 caractères"),
  excerpt: z.string().optional().or(z.literal("")),
  coverImage: z.string().optional().or(z.literal("")),
  published: z.boolean().default(true),
  publishedAt: z.string().min(1, "La date de publication est requise"),
})

export type NewsFormData = z.infer<typeof newsSchema>
