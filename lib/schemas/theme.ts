import { z } from "zod"
import { parseThemeYears } from "@/lib/themes/active"
import { isSkinKey } from "@/lib/skins/registry"

const optionalText = (max: number) =>
  z.string().max(max, `${max} caractères maximum`).optional().or(z.literal(""))

export const themeSchema = z.object({
  nameFr: z
    .string()
    .trim()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(80, "Le nom ne peut pas dépasser 80 caractères"),
  nameEn: optionalText(80),
  slug: z
    .string()
    .min(2, "Le slug doit contenir au moins 2 caractères")
    .max(60, "Le slug ne peut pas dépasser 60 caractères")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
    ),
  descriptionFr: optionalText(600),
  descriptionEn: optionalText(600),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Couleur attendue au format #rrggbb"),
  // Uploaded image (https) or a bundled asset path such as /themes/x.svg.
  markerImage: z
    .string()
    .regex(/^(https:\/\/|\/(?!\/))\S+$/, "Image invalide : adresse https ou chemin /…")
    .optional()
    .or(z.literal("")),
  showOnHome: z.boolean().default(false),
  // Free text such as "2027" or "2027, 2028"; empty means every edition.
  years: z
    .string()
    .default("")
    .refine((value) => parseThemeYears(value) !== null, "Années attendues au format 2027, 2028"),
  skin: z
    .string()
    .default("")
    .refine((value) => value === "" || isSkinKey(value), "Habillage inconnu"),
  order: z.coerce.number().int().min(0).default(0),
})

export type ThemeFormData = z.infer<typeof themeSchema>
