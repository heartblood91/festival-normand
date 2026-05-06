const getDateLocale = (locale: string): string => (locale === "en" ? "en-US" : "fr-FR")

export const formatEventDate = (date: Date | string, locale: string): string =>
  new Intl.DateTimeFormat(getDateLocale(locale), {
    weekday: "short",
    day: "numeric",
    month: "long",
  }).format(new Date(date))

export const formatNewsDate = (date: Date | string, locale: string): string =>
  new Intl.DateTimeFormat(getDateLocale(locale), {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))

export const formatFullDate = (date: Date | string, locale: string): string =>
  new Intl.DateTimeFormat(getDateLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))

export const formatTime = (time: string | undefined): string | undefined => {
  if (!time) return undefined
  return time.slice(0, 5)
}

const sameDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

/**
 * Renders a single date or a date range. Collapses to a single date when start
 * and end fall on the same day. Within the same month, the start drops the
 * month label: "29 - sam. 31 mai". Across months: "ven. 29 mai - mar. 2 juin".
 */
export const formatEventDateRange = (
  start: Date | string,
  end: Date | string | null | undefined,
  locale: string
): string => {
  const startDate = new Date(start)
  if (!end) return formatEventDate(startDate, locale)

  const endDate = new Date(end)
  if (sameDay(startDate, endDate)) return formatEventDate(startDate, locale)

  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    const startDayOnly = new Intl.DateTimeFormat(getDateLocale(locale), {
      weekday: "short",
      day: "numeric",
    }).format(startDate)
    return `${startDayOnly} – ${formatEventDate(endDate, locale)}`
  }
  return `${formatEventDate(startDate, locale)} – ${formatEventDate(endDate, locale)}`
}
