import { z } from "zod"

export const eventSchema = z.object({
  titleFr: z
    .string()
    .min(3, "Le titre doit contenir au moins 3 caractères")
    .max(200, "Le titre ne peut pas dépasser 200 caractères"),
  titleEn: z.string().optional().or(z.literal("")),
  slug: z
    .string()
    .min(3, "Le slug doit contenir au moins 3 caractères")
    .max(200, "Le slug ne peut pas dépasser 200 caractères")
    .regex(/^[a-z0-9-]+$/, "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"),
  descriptionFr: z
    .string()
    .min(10, "La description doit contenir au moins 10 caractères"),
  descriptionEn: z.string().optional().or(z.literal("")),
  location: z
    .string()
    .min(2, "Le lieu doit contenir au moins 2 caractères"),
  city: z
    .string()
    .min(2, "La ville doit contenir au moins 2 caractères"),
  postalCode: z
    .string()
    .min(4, "Le code postal doit contenir au moins 4 caractères")
    .max(10, "Le code postal ne peut pas dépasser 10 caractères"),
  department: z.enum(["CALVADOS", "EURE", "MANCHE", "ORNE", "SEINE_MARITIME"], {
    message: "Veuillez sélectionner un département",
  }),
  category: z.enum(["ILLUMINATIONS", "EXPOSITIONS", "ANIMATIONS", "VISITES"], {
    message: "Veuillez sélectionner une catégorie",
  }),
  dateStart: z.string().min(1, "La date de début est requise"),
  dateEnd: z.string().optional().or(z.literal("")),
  timeStart: z.string().optional().or(z.literal("")),
  timeEnd: z.string().optional().or(z.literal("")),
  pricingFr: z.string().optional().or(z.literal("")),
  pricingEn: z.string().optional().or(z.literal("")),
  organizer: z.string().optional().or(z.literal("")),
  email: z.string().email("Email invalide").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.literal("").transform(() => undefined)),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.literal("").transform(() => undefined)),
  coverImage: z.string().optional().or(z.literal("")),
  featured: z.boolean().default(false),
  accessible: z.boolean().default(false),
  published: z.boolean().default(true),
})

export type EventFormData = z.infer<typeof eventSchema>

export const DEPARTMENT_OPTIONS = [
  { value: "CALVADOS", label: "Calvados" },
  { value: "EURE", label: "Eure" },
  { value: "MANCHE", label: "Manche" },
  { value: "ORNE", label: "Orne" },
  { value: "SEINE_MARITIME", label: "Seine-Maritime" },
] as const

export const CATEGORY_OPTIONS = [
  { value: "ILLUMINATIONS", label: "Illuminations" },
  { value: "EXPOSITIONS", label: "Expositions" },
  { value: "ANIMATIONS", label: "Animations" },
  { value: "VISITES", label: "Visites" },
] as const

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}
