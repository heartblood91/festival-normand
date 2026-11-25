import type { Locale } from "@/lib/i18n/config"
import { EMPTY_SKIN_TEXTS, type SkinTexts } from "@/lib/skins/texts"

/**
 * Default texts live with the skin so that removing its folder removes them too.
 * Editors override them from the theme form ("Période et habillage").
 */
const COPY = {
  fr: {
    title: "Millénaire de Guillaume le Conquérant",
    dates: "1027 – 2027",
    cta: "Les événements du millénaire",
  },
  en: {
    title: "Millennium of William the Conqueror",
    dates: "1027 – 2027",
    cta: "Millennium events",
  },
} as const

export const millenniumCopy = (locale: Locale, texts: SkinTexts = EMPTY_SKIN_TEXTS) => ({
  title: texts.title ?? COPY[locale].title,
  dates: texts.dates ?? COPY[locale].dates,
  cta: texts.cta ?? COPY[locale].cta,
})
