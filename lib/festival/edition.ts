import type { Locale } from "@/lib/i18n/config"

/**
 * Current festival edition, derived from the settings editors save in
 * /admin/edition (see `getCurrentEdition`). Pure helpers only: no DB access.
 *
 * The public site has two date-driven faces:
 *  - "upcoming": until the bilan switch. Countdown, the nights, editorial
 *    picks, programme teaser.
 *  - "bilan": from the switch on. Retrospective of the edition that ended.
 *
 * Saving the next edition's dates flips the site back to "upcoming".
 */
export type EditionMode = "upcoming" | "bilan"

export type EditionSettings = {
  year: number
  /** ISO yyyy-mm-dd, Paris local day of the first night */
  dateStart: string
  /** ISO yyyy-mm-dd, Paris local day of the last night */
  dateEnd: string
  /** First day of the bilan; defaults to the day after the last night */
  bilanFrom?: string | null
}

export type NightRole = "opening" | "main" | "closing"

export type FestivalNight = {
  /** Day of month, used as the `?date=` filter value */
  code: string
  date: string
  role: NightRole
}

export type Edition = {
  year: number
  ordinal: number
  dateStart: string
  dateEnd: string
  bilanFrom: string
  departmentsCount: number
  nights: FestivalNight[]
}

// Provisional until the organisers confirm the 2027 dates (editable in admin).
export const DEFAULT_EDITION_SETTINGS: EditionSettings = {
  year: 2027,
  dateStart: "2027-05-21",
  dateEnd: "2027-05-23",
}

// Born in the Orne in 2009: 2026 was the 17th edition.
const FIRST_YEAR = 2009
const DEPARTMENTS_COUNT = 5
export const MAX_NIGHTS = 5

const MS_PER_DAY = 24 * 60 * 60 * 1000
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const PARIS = "Europe/Paris"

// Noon UTC keeps the calendar day stable whatever the formatting time zone.
const utcNoon = (isoDate: string) => new Date(`${isoDate}T12:00:00Z`)

const addDays = (isoDate: string, days: number) =>
  new Date(utcNoon(isoDate).getTime() + days * MS_PER_DAY).toISOString().slice(0, 10)

const isValidIsoDate = (value: string) =>
  ISO_DATE.test(value) && utcNoon(value).toISOString().slice(0, 10) === value

const parisOffset = (isoDate: string) => {
  const name = new Intl.DateTimeFormat("en-US", { timeZone: PARIS, timeZoneName: "shortOffset" })
    .formatToParts(utcNoon(isoDate))
    .find((part) => part.type === "timeZoneName")?.value
  const match = name?.match(/GMT([+-]\d+)/)
  const hours = match ? Number(match[1]) : 1
  return `${hours < 0 ? "-" : "+"}${String(Math.abs(hours)).padStart(2, "0")}:00`
}

const atParisMidnight = (isoDate: string) => new Date(`${isoDate}T00:00:00${parisOffset(isoDate)}`)

const nightCount = (dateStart: string, dateEnd: string) =>
  Math.round((utcNoon(dateEnd).getTime() - utcNoon(dateStart).getTime()) / MS_PER_DAY) + 1

export const validateEditionSettings = (settings: EditionSettings): string[] => {
  const errors: string[] = []
  const { year, dateStart, dateEnd, bilanFrom } = settings

  if (!Number.isInteger(year) || year < FIRST_YEAR || year > 2100) {
    errors.push("Année invalide.")
  }
  if (!isValidIsoDate(dateStart) || !isValidIsoDate(dateEnd)) {
    errors.push("Dates invalides (format attendu : AAAA-MM-JJ).")
    return errors
  }
  if (!dateStart.startsWith(`${year}-`)) {
    errors.push("La première nuit doit tomber pendant l'année de l'édition.")
  }
  const count = nightCount(dateStart, dateEnd)
  if (count < 1) errors.push("La dernière nuit doit suivre la première.")
  if (count > MAX_NIGHTS) errors.push(`Une édition compte au plus ${MAX_NIGHTS} nuits.`)
  if (bilanFrom) {
    if (!isValidIsoDate(bilanFrom)) errors.push("Date de bascule invalide.")
    else if (bilanFrom <= dateEnd) errors.push("Le bilan commence après la dernière nuit.")
  }
  return errors
}

const roleAt = (index: number, total: number): NightRole => {
  if (index === 0) return "opening"
  if (index === total - 1) return "closing"
  return "main"
}

export const buildEdition = (settings: EditionSettings): Edition => {
  const count = Math.min(Math.max(nightCount(settings.dateStart, settings.dateEnd), 1), MAX_NIGHTS)
  const nights = Array.from({ length: count }, (_, index) => {
    const date = addDays(settings.dateStart, index)
    return { code: date.slice(8, 10), date, role: roleAt(index, count) }
  })

  return {
    year: settings.year,
    ordinal: settings.year - FIRST_YEAR,
    dateStart: settings.dateStart,
    dateEnd: settings.dateEnd,
    bilanFrom: settings.bilanFrom || addDays(settings.dateEnd, 1),
    departmentsCount: DEPARTMENTS_COUNT,
    nights,
  }
}

/**
 * Night codes from a `?date=` value ("21" or "21,23"), restricted to the
 * nights of the edition and returned in night order without duplicates.
 */
export const parseNightCodes = (raw: string | string[] | undefined, edition: Edition): string[] => {
  const requested = new Set(
    (Array.isArray(raw) ? raw : (raw ?? "").split(",")).map((code) => code.trim())
  )
  return edition.nights.map((night) => night.code).filter((code) => requested.has(code))
}

export const getEditionMode = (edition: Edition, now: Date = new Date()): EditionMode => {
  // Optional override to preview the other face before its date window (and for
  // QA). Set NEXT_PUBLIC_PEL_FORCE_MODE to "upcoming" or "bilan".
  const forced = process.env.NEXT_PUBLIC_PEL_FORCE_MODE
  if (forced === "upcoming" || forced === "bilan") return forced
  return now.getTime() < atParisMidnight(edition.bilanFrom).getTime() ? "upcoming" : "bilan"
}

/** Whole days until the first night (0 once the festival has started). */
export const getCountdownDays = (edition: Edition, now: Date = new Date()): number => {
  const diff = atParisMidnight(edition.dateStart).getTime() - now.getTime()
  return Math.max(0, Math.ceil(diff / MS_PER_DAY))
}

export const isDuringFestival = (edition: Edition, now: Date = new Date()): boolean => {
  const t = now.getTime()
  return (
    t >= atParisMidnight(edition.dateStart).getTime() &&
    t < atParisMidnight(addDays(edition.dateEnd, 1)).getTime()
  )
}

/** Calendar year of the edition, in server local time like the event dates. */
export const editionYearRange = (edition: Edition) => ({
  gte: new Date(`${edition.year}-01-01T00:00:00`),
  lt: new Date(`${edition.year + 1}-01-01T00:00:00`),
})

const intlLocale = (locale: Locale) => (locale === "en" ? "en-GB" : "fr-FR")

const part = (isoDate: string, locale: Locale, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat(intlLocale(locale), { timeZone: "UTC", ...options }).format(
    utcNoon(isoDate)
  )

const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1)

const day = (isoDate: string) => String(Number(isoDate.slice(8, 10)))
const month = (isoDate: string, locale: Locale) => part(isoDate, locale, { month: "long" })

export const editionDateRange = (edition: Edition, locale: Locale): string => {
  const { dateStart, dateEnd, year } = edition
  const sameMonth = dateStart.slice(0, 7) === dateEnd.slice(0, 7)
  const single = dateStart === dateEnd

  if (locale === "en") {
    const startMonth = month(dateStart, "en")
    if (single) return `${startMonth} ${day(dateStart)}, ${year}`
    return sameMonth
      ? `${startMonth} ${day(dateStart)}–${day(dateEnd)}, ${year}`
      : `${startMonth} ${day(dateStart)} – ${month(dateEnd, "en")} ${day(dateEnd)}, ${year}`
  }
  if (single) return `${day(dateStart)} ${month(dateStart, "fr")} ${year}`
  return sameMonth
    ? `${day(dateStart)} — ${day(dateEnd)} ${month(dateEnd, "fr")} ${year}`
    : `${day(dateStart)} ${month(dateStart, "fr")} — ${day(dateEnd)} ${month(dateEnd, "fr")} ${year}`
}

/** Nav/hero kicker, e.g. "18ᵉ édition · 21 — 23 mai 2027" or replay label. */
export const editionKicker = (edition: Edition, mode: EditionMode, locale: Locale): string => {
  if (mode === "bilan") {
    return locale === "en" ? `${edition.year} edition · Replay` : `Édition ${edition.year} · Replay`
  }
  const ord = locale === "en" ? `${edition.ordinal}th edition` : `${edition.ordinal}ᵉ édition`
  return `${ord} · ${editionDateRange(edition, locale)}`
}

/**
 * "Ven 21" (short), "Ven 21 mai" / "Fri May 21" (long), "Vendredi" (weekday),
 * "mai 2027" (monthYear).
 */
export const formatNight = (
  night: FestivalNight,
  locale: Locale,
  style: "short" | "long" | "weekday" | "monthYear"
): string => {
  if (style === "weekday") return capitalize(part(night.date, locale, { weekday: "long" }))
  if (style === "monthYear") return `${month(night.date, locale)} ${night.date.slice(0, 4)}`
  const weekday = capitalize(part(night.date, locale, { weekday: "short" }).replace(".", ""))
  if (style === "short") return `${weekday} ${day(night.date)}`
  return locale === "en"
    ? `${weekday} ${month(night.date, "en")} ${day(night.date)}`
    : `${weekday} ${day(night.date)} ${month(night.date, "fr")}`
}
