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
