import type { Locale } from "@/lib/i18n/config"

/**
 * Single source of truth for the current festival edition.
 *
 * The public site has two date-driven faces:
 *  - "upcoming": Jan 1 → the bilan switch (~June 1). Countdown, the three
 *    nights, editorial picks, programme teaser.
 *  - "bilan": switch → Dec 31. Retrospective of the edition that just ended.
 *
 * Bump this config when preparing a new edition. Because `getEditionMode`
 * keys off `bilanFrom`, bumping `year`/dates to N+1 automatically flips the
 * site back to "upcoming" — no empty home in January.
 */
export type EditionMode = "upcoming" | "bilan"

export type FestivalNight = {
  code: "29" | "30" | "31"
  date: string // ISO yyyy-mm-dd
  weekdayFr: string
  weekdayEn: string
  /** Editorial sub-title for the night */
  subFr: string
  subEn: string
  descFr: string
  descEn: string
}

const PARIS_SUMMER_OFFSET = "+02:00"

export const EDITION = {
  year: 2026,
  ordinal: 17,
  dateStart: "2026-05-29",
  dateEnd: "2026-05-31",
  /** From this date (inclusive) the site shows the bilan of `year`. */
  bilanFrom: "2026-06-01",
  departmentsCount: 5,
  nights: [
    {
      code: "29",
      date: "2026-05-29",
      weekdayFr: "Vendredi",
      weekdayEn: "Friday",
      subFr: "L'ouverture",
      subEn: "The opening",
      descFr: "Veillées, premières illuminations, concerts dans les abbayes.",
      descEn: "Vigils, first illuminations, concerts in the abbeys.",
    },
    {
      code: "30",
      date: "2026-05-30",
      weekdayFr: "Samedi",
      weekdayEn: "Saturday",
      subFr: "Le grand soir",
      subEn: "The big night",
      descFr: "Mappings monumentaux, balades aux flambeaux, créations lumière.",
      descEn: "Monumental mappings, torch-lit walks, light creations.",
    },
    {
      code: "31",
      date: "2026-05-31",
      weekdayFr: "Dimanche",
      weekdayEn: "Sunday",
      subFr: "La clôture",
      subEn: "The closing",
      descFr: "Récitals intimes, marches silencieuses, derniers feux.",
      descEn: "Intimate recitals, silent walks, final lights.",
    },
  ] satisfies FestivalNight[],
} as const

const atParisMidnight = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00${PARIS_SUMMER_OFFSET}`)

const MS_PER_DAY = 24 * 60 * 60 * 1000

export const getEditionMode = (now: Date = new Date()): EditionMode => {
  // Optional override to preview the other face before its date window (and for
  // QA). Set NEXT_PUBLIC_PEL_FORCE_MODE to "upcoming" or "bilan".
  const forced = process.env.NEXT_PUBLIC_PEL_FORCE_MODE
  if (forced === "upcoming" || forced === "bilan") return forced
  return now.getTime() < atParisMidnight(EDITION.bilanFrom).getTime()
    ? "upcoming"
    : "bilan"
}

/** Whole days until the first night (0 once the festival has started). */
export const getCountdownDays = (now: Date = new Date()): number => {
  const diff = atParisMidnight(EDITION.dateStart).getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / MS_PER_DAY))
}

export const isDuringFestival = (now: Date = new Date()): boolean => {
  const t = now.getTime()
  return (
    t >= atParisMidnight(EDITION.dateStart).getTime() &&
    t < atParisMidnight(EDITION.dateEnd).getTime() + MS_PER_DAY
  )
}

export const editionDateRange = (locale: Locale): string => {
  if (locale === "en") return `May 29–31, ${EDITION.year}`
  return `29 — 31 mai ${EDITION.year}`
}

/** Nav/hero kicker, e.g. "17ᵉ édition · 29 — 31 mai 2026" or replay label. */
export const editionKicker = (mode: EditionMode, locale: Locale): string => {
  if (mode === "bilan") {
    return locale === "en"
      ? `${EDITION.year} edition · Replay`
      : `Édition ${EDITION.year} · Replay`
  }
  const ord = locale === "en" ? `${EDITION.ordinal}th edition` : `${EDITION.ordinal}ᵉ édition`
  return `${ord} · ${editionDateRange(locale)}`
}
