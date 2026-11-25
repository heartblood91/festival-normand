import type { Locale } from "@/lib/i18n/config"

/** Ribbon texts entered in the theme form, as stored (null or "" when left empty). */
export type SkinTextsInput = {
  ribbonTitleFr: string | null
  ribbonTitleEn: string | null
  ribbonDatesFr: string | null
  ribbonDatesEn: string | null
  ribbonCtaFr: string | null
  ribbonCtaEn: string | null
}

/** Texts handed to a skin; null lets the skin use its bundled copy. */
export type SkinTexts = { title: string | null; dates: string | null; cta: string | null }

export const EMPTY_SKIN_TEXTS: SkinTexts = { title: null, dates: null, cta: null }

const pick = (fr: string | null, en: string | null, locale: Locale) =>
  (locale === "en" ? en?.trim() || fr?.trim() : fr?.trim()) || null

/** English falls back to the French text, then (null) to the skin's default. */
export const localizeSkinTexts = (input: SkinTextsInput, locale: Locale): SkinTexts => ({
  title: pick(input.ribbonTitleFr, input.ribbonTitleEn, locale),
  dates: pick(input.ribbonDatesFr, input.ribbonDatesEn, locale),
  cta: pick(input.ribbonCtaFr, input.ribbonCtaEn, locale),
})
