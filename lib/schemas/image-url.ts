import { z } from "zod"

// Uploads land on local disk (/uploads/…), on S3 behind app/media (/media/…)
// or on the blob store; site assets (/images/…) are accepted too. Other hosts
// would fail in next/image.
export const imageUrlSchema = z
  .string()
  .max(500)
  .regex(
    /^(\/(uploads|images|media)(\/[\w-]+)+\.[a-z0-9]+|https:\/\/[\w-]+\.public\.blob\.vercel-storage\.com\/\S+)$/i,
    "Adresse d'image invalide"
  )
