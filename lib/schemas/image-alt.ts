import { z } from "zod"
import { missingAltMessage } from "@/lib/admin/alt-text"

export const altTextField = z
  .string()
  .max(250, "Le texte alternatif ne peut pas dépasser 250 caractères")
  .optional()
  .or(z.literal(""))

export const MISSING_COVER_ALT =
  "Décrivez l'image de couverture (texte alternatif) avant de publier"

/**
 * RGAA 1.1/1.2: published content may not show an image without a text
 * alternative. Drafts stay savable so editors can finish later.
 */
export const checkImageAlts = (
  data: {
    published?: boolean
    coverImage?: string
    coverImageAltFr?: string
    richText: Record<string, string | undefined>
  },
  ctx: z.RefinementCtx
) => {
  if (!data.published) return
  if (data.coverImage && !data.coverImageAltFr?.trim()) {
    ctx.addIssue({ code: "custom", path: ["coverImageAltFr"], message: MISSING_COVER_ALT })
  }
  Object.entries(data.richText).forEach(([field, html]) => {
    const message = missingAltMessage(html ?? "")
    if (message) ctx.addIssue({ code: "custom", path: [field], message })
  })
}
