"use server"

import { requireRole } from "@/lib/rbac"
import { translateText } from "@/lib/ai/openrouter"

export const translateContent = async (
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> => {
  await requireRole("EDITOR")
  return translateText(text, fromLang, toLang)
}
