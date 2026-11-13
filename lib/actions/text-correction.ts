"use server"

import { revalidatePath } from "next/cache"
import { requireRole } from "@/lib/rbac"
import { isAiConfigured } from "@/lib/ai/openrouter"
import { revalidatePublic } from "@/lib/revalidate-public"
import { correctPendingTexts } from "@/lib/tourinsoft/text-correction"

// Each event is one proofreading call plus, when it changed, its translation.
const BATCH_SIZE = 10

export type TextCorrectionActionResult = {
  success: boolean
  message: string
  remaining?: number
}

const plural = (count: number, word: string) => `${count} ${word}${count > 1 ? "s" : ""}`

export const correctImportedTextsBatch = async (): Promise<TextCorrectionActionResult> => {
  try {
    await requireRole("EDITOR")
    if (!isAiConfigured()) {
      return {
        success: false,
        message: "La correction demande une clé OpenRouter (OPENROUTER_API_KEY) sur le serveur.",
      }
    }

    const report = await correctPendingTexts(BATCH_SIZE)
    if (report.slugs.length) {
      revalidatePublic("/evenements", "/", ...report.slugs.map((slug) => `/evenement/${slug}`))
    }
    revalidatePath("/[locale]/admin", "layout")

    const parts = [
      `${plural(report.corrected, "fiche")} corrigée${report.corrected > 1 ? "s" : ""}`,
    ]
    if (report.unchanged) {
      parts.push(`${report.unchanged} déjà correcte${report.unchanged > 1 ? "s" : ""}`)
    }
    if (report.failed) parts.push(plural(report.failed, "échec"))
    parts.push(`${report.remaining} restante${report.remaining > 1 ? "s" : ""}`)
    return {
      success: report.failed === 0,
      message: `${parts.join(", ")}.`,
      remaining: report.remaining,
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "La correction a échoué.",
    }
  }
}
