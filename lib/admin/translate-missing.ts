import { translateMultipleFields } from "@/lib/actions/ai-publish"
import { fillMissingTranslations, missingTranslationSource } from "@/lib/admin/publish-flow"

/**
 * FR → EN machine translation of the fields whose English version is empty.
 * Returns only the fields it filled, so callers never touch existing work.
 */
export const translateMissingFields = async (
  pairs: Record<string, [source: string, target: string]>
): Promise<Record<string, string>> => {
  const source = missingTranslationSource(pairs)
  if (Object.keys(source).length === 0) return {}

  const proposed = await translateMultipleFields(source, "fr", "en")
  const empty = Object.fromEntries(Object.keys(source).map((field) => [field, ""]))
  return Object.fromEntries(
    Object.entries(fillMissingTranslations(empty, proposed)).filter(([, value]) => value)
  )
}
