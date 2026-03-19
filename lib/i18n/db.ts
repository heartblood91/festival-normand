import type { Locale } from "./config"

export const pickLocale = <T extends Record<string, unknown>>(
  item: T,
  locale: Locale,
  field: string
): string => {
  const enField = `${field}En` as keyof T
  const frField = `${field}Fr` as keyof T

  if (locale === "en" && item[enField]) {
    return item[enField] as string
  }
  return (item[frField] as string) ?? ""
}

export const localizeEntity = <T extends Record<string, unknown>>(
  item: T,
  locale: Locale,
  fields: string[]
): T & Record<string, string> => {
  const result = { ...item } as Record<string, unknown>
  for (const field of fields) {
    result[field] = pickLocale(item, locale, field)
  }
  return result as T & Record<string, string>
}
