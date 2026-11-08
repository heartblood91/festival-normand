export const FAVORITES_STORAGE_KEY = "pel:travel-book"
export const MAX_FAVORITES = 100

const EVENT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/
const FESTIVAL_TIME_ZONE = "Europe/Paris"

const isEventId = (value: unknown): value is string =>
  typeof value === "string" && EVENT_ID_PATTERN.test(value)

const dedupe = (ids: string[]) => [...new Set(ids)]

/** Reads the localStorage value; corrupted or foreign data yields an empty list. */
export const parseFavorites = (raw: string | null): string[] => {
  if (!raw) return []
  try {
    const parsed: unknown = JSON.parse(raw)
    return Array.isArray(parsed) ? dedupe(parsed.filter(isEventId)).slice(-MAX_FAVORITES) : []
  } catch {
    return []
  }
}

export const toggleFavorite = (ids: string[], id: string): string[] =>
  ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id].slice(-MAX_FAVORITES)

/** Canonical form of a selection: valid, unique and sorted ids. */
export const normalizeEventIds = (ids: unknown[]): string[] =>
  dedupe(ids.filter(isEventId)).sort().slice(0, MAX_FAVORITES)

type GroupableEvent = {
  id: string
  city: string | null
  dateStart: string | null
  timeStart: string | null
}

export type TravelBookGroup<T> = {
  key: string
  /** Day or commune; null groups the events without one. */
  label: string | null
  events: T[]
}

export type TravelBookGrouping = "date" | "place"

const dayKey = (date: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: FESTIVAL_TIME_ZONE }).format(new Date(date))

const dayLabel = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", {
    timeZone: FESTIVAL_TIME_ZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date(date))

const byStart = (a: GroupableEvent, b: GroupableEvent) =>
  (a.dateStart ?? "").localeCompare(b.dateStart ?? "") ||
  (a.timeStart ?? "99").localeCompare(b.timeStart ?? "99")

/** Groups by festival day or by commune; the unknown group always comes last. */
export const groupTravelBook = <T extends GroupableEvent>(
  events: T[],
  grouping: TravelBookGrouping,
  locale: string
): TravelBookGroup<T>[] => {
  const groups = new Map<string, TravelBookGroup<T>>()
  const sorted = [...events].sort(byStart)

  for (const event of sorted) {
    const value = grouping === "date" ? event.dateStart : event.city?.trim() || null
    const key = value === null ? "" : grouping === "date" ? dayKey(value) : value
    const label = value === null ? null : grouping === "date" ? dayLabel(value, locale) : value
    const group = groups.get(key) ?? { key, label, events: [] }
    group.events.push(event)
    groups.set(key, group)
  }

  return [...groups.values()].sort((a, b) => {
    if (a.label === null) return 1
    if (b.label === null) return -1
    return a.key.localeCompare(b.key, locale, { sensitivity: "base" })
  })
}
