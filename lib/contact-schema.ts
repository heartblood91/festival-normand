import { z } from "zod"

export const DEPARTMENT_OPTIONS = [
  { value: "CALVADOS", label: "Calvados" },
  { value: "EURE", label: "Eure" },
  { value: "MANCHE", label: "Manche" },
  { value: "ORNE", label: "Orne" },
  { value: "SEINE_MARITIME", label: "Seine-Maritime" },
] as const

export const DEPARTMENT_EMAILS: Record<string, string> = {
  CALVADOS: "patrimoine@calvados.fr",
  EURE: "patrimoine@eure.fr",
  MANCHE: "patrimoine@manche.fr",
  ORNE: "patrimoine@orne.fr",
  SEINE_MARITIME: "patrimoine@seine-maritime.fr",
}

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne doit pas dépasser 100 caractères"),
  email: z.string().email("Adresse email invalide"),
  department: z.enum(["CALVADOS", "EURE", "MANCHE", "ORNE", "SEINE_MARITIME"], {
    message: "Veuillez sélectionner un département",
  }),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères")
    .max(5000, "Le message ne doit pas dépasser 5000 caractères"),
  honeypot: z.string().max(0, "Spam detected").optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>
