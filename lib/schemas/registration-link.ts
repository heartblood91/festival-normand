import { z } from "zod"

// A department's registration URL — empty string means "not configured yet".
export const registrationLinkUrlSchema = z.string().url("URL invalide").or(z.literal(""))
