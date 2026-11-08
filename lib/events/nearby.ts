type Dated = { dateStart: string | null; dateEnd: string | null }

/** Same-day suggestions stay within a short drive of the current site. */
export const NEARBY_SUGGESTION_RADIUS_KM = 30
export const NEARBY_SUGGESTION_LIMIT = 6

// Event times are stored as naive local times, like the night filter reads them.
const localDay = (iso: string) => {
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const dayRange = ({ dateStart, dateEnd }: Dated) =>
  dateStart ? { from: localDay(dateStart), to: localDay(dateEnd ?? dateStart) } : null

export const sharesADay = (a: Dated, b: Dated): boolean => {
  const first = dayRange(a)
  const second = dayRange(b)
  if (!first || !second) return false
  return first.from <= second.to && second.from <= first.to
}

/**
 * "Le même jour, à proximité": neighbours (already sorted by distance) open on
 * a day the current event is on. Falls back to the nearest events otherwise.
 */
export const pickNearbySuggestions = <T extends Dated & { distanceKm: number }>(
  event: Dated,
  neighbours: T[],
  { limit = NEARBY_SUGGESTION_LIMIT, radiusKm = NEARBY_SUGGESTION_RADIUS_KM } = {}
): { sameDay: boolean; items: T[] } => {
  const sameDay = neighbours.filter(
    (neighbour) => neighbour.distanceKm <= radiusKm && sharesADay(event, neighbour)
  )
  return sameDay.length > 0
    ? { sameDay: true, items: sameDay.slice(0, limit) }
    : { sameDay: false, items: neighbours.slice(0, limit) }
}
