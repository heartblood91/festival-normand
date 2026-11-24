export const locales = ["fr", "en"] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = "fr"

/** Untrusted input (e.g. a public server action argument) narrowed to a known locale. */
export const toLocale = (value: unknown): Locale =>
  locales.includes(value as Locale) ? (value as Locale) : defaultLocale
