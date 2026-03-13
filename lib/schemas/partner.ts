import { z } from "zod"

export const partnerSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
  logo: z.string().optional().or(z.literal("")),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  order: z.coerce.number().int().min(0).default(0),
})

export type PartnerFormData = z.infer<typeof partnerSchema>
