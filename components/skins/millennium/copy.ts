import type { Locale } from "@/lib/i18n/config"

/** Texts live with the skin so that removing its folder removes them too. */
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

export const millenniumCopy = (locale: Locale) => COPY[locale]
