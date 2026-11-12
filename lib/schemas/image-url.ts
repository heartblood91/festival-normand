import { z } from "zod"

// Uploads land either on local disk (/uploads/…) or on the blob store; site
// assets (/images/…) are accepted too. Other hosts would fail in next/image.
export const imageUrlSchema = z
  .string()
  .max(500)
  .regex(
    /^(\/(uploads|images)(\/[\w-]+)+\.[a-z0-9]+|https:\/\/[\w-]+\.public\.blob\.vercel-storage\.com\/\S+)$/i,
    "Adresse d'image invalide"
  )
