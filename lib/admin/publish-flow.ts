import type { SpellingCorrection } from "@/lib/actions/ai-publish"

/** The AI review runs once, when a draft goes live — not on every later save. */
export const needsPublishWizard = ({
  wasPublished,
  willPublish,
}: {
  wasPublished: boolean
  willPublish: boolean
}): boolean => willPublish && !wasPublished

/** Empty rich-text output such as "<p></p>" counts as blank. */
export const isBlank = (value: string): boolean =>
  !value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim()

/**
 * Machine translations only fill target fields the editor left empty: an
 * existing translation is the editor's work and is never overwritten.
 */
export const fillMissingTranslations = (
  current: Record<string, string>,
  proposed: Record<string, string>
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(current).map(([field, value]) => {
      const proposal = proposed[field]?.trim()
      return [field, isBlank(value) && proposal ? proposal : value]
    })
  )

/** Source values whose translation is still empty, keyed by field name. */
export const missingTranslationSource = (
  pairs: Record<string, [source: string, target: string]>
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(pairs)
      .filter(([, [source, target]]) => !isBlank(source) && isBlank(target))
      .map(([field, [source]]) => [field, source])
  )

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

/**
 * Applies accepted corrections in a single pass (so one fix cannot be
 * re-corrected by another), on whole words, outside HTML tags.
 */
export const applySpellingCorrections = (
  text: string,
  corrections: SpellingCorrection[]
): string => {
  const replacements = new Map(
    corrections
      .filter(({ original, corrected }) => original.trim() && original !== corrected)
      .map(({ original, corrected }) => [original, corrected])
  )
  if (replacements.size === 0) return text

  const alternatives = [...replacements.keys()]
    .sort((a, b) => b.length - a.length)
    .map(escapeRegExp)
    .join("|")
  const words = new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternatives})(?![\\p{L}\\p{N}])`, "gu")

  return text
    .split(/(<[^>]*>)/)
    .map((part) =>
      part.startsWith("<") ? part : part.replace(words, (match) => replacements.get(match) ?? match)
    )
    .join("")
}
