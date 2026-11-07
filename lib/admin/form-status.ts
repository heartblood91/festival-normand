import { isBlank } from "@/lib/admin/publish-flow"

export type LocaleTabState = "error" | "incomplete" | null

/**
 * Badge for each language tab: "error" when the server rejected one of its
 * fields, "incomplete" when it lacks a field filled in the other language.
 * Fields are listed in the same order for both languages.
 */
export const localeTabStatus = ({
  fields,
  errors,
  values,
}: {
  fields: { fr: string[]; en: string[] }
  errors: Record<string, string[] | undefined>
  values: Record<string, string>
}): { fr: LocaleTabState; en: LocaleTabState } => {
  const state = (own: string[], other: string[]): LocaleTabState => {
    if (own.some((field) => errors[field]?.length)) return "error"
    const missing = own.some(
      (field, index) => isBlank(values[field] ?? "") && !isBlank(values[other[index]] ?? "")
    )
    return missing ? "incomplete" : null
  }
  return { fr: state(fields.fr, fields.en), en: state(fields.en, fields.fr) }
}

// en-CA formats dates as yyyy-mm-dd.
const parisDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Paris",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
})

/**
 * yyyy-mm-dd of the festival's calendar day. toISOString gives the UTC day
 * (yesterday before 2 am in summer); a fixed zone also renders the same on the
 * server and in the browser.
 */
export const toLocalDateInput = (date: Date): string => parisDay.format(date)
