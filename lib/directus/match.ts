// Match legacy v1 events against events of the new site when no shared id is
// available. Used by the read-only v1/prod report and the recovery import.
import { slugify } from "@/lib/schemas/event"

export type MatchCandidate = {
  id: string
  title: string
  slug: string
  city: string | null
  latitude: number | null
  longitude: number | null
  dateStart?: Date | null
}

export type MatchSource = {
  title: string
  cities: string[]
  latitude: number | null
  longitude: number | null
  dateStart?: Date | null
}

export type MatchVia = "title+commune" | "slug" | "geo+title" | "geo"
export type Match = { candidateId: string; via: MatchVia }

type Point = { latitude: number; longitude: number }

const SAME_SITE_METERS = 250
const SAME_SPOT_METERS = 50
// Same edition: festival weekends are a year apart, the UTC/Paris shift is hours.
const SAME_EDITION_MS = 7 * 24 * 60 * 60 * 1000

// Words every PEL title shares; they say nothing about which site it is.
const STOP_WORDS = new Set(
  "les des aux sur pour par dans avec une pierres pierre lumieres lumiere eglise chapelle saint sainte".split(
    " "
  )
)

const titleTokens = (title: string) =>
  new Set(
    slugify(title)
      .split("-")
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token) && !/^\d+$/.test(token))
  )

export const titleSimilarity = (a: string, b: string): number => {
  const left = titleTokens(a)
  const right = titleTokens(b)
  const shared = [...left].filter((token) => right.has(token)).length
  const union = new Set([...left, ...right]).size
  return union === 0 ? 0 : shared / union
}

export const distanceMeters = (a: Point, b: Point): number => {
  const rad = Math.PI / 180
  const dLat = (b.latitude - a.latitude) * rad
  const dLng = (b.longitude - a.longitude) * rad
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * rad) * Math.cos(b.latitude * rad) * Math.sin(dLng / 2) ** 2
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h))
}

const hasPoint = <T extends { latitude: number | null; longitude: number | null }>(
  value: T
): value is T & Point => value.latitude !== null && value.longitude !== null

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

const sameEdition = (source: MatchSource, candidate: MatchCandidate) =>
  !source.dateStart ||
  !candidate.dateStart ||
  Math.abs(source.dateStart.getTime() - candidate.dateStart.getTime()) <= SAME_EDITION_MS

const exactMatch = (source: MatchSource, candidates: MatchCandidate[]): Match | null => {
  const title = slugify(source.title)
  const cities = new Set(source.cities.map(slugify))
  const sameTitle = candidates.filter((c) => slugify(c.title) === title)
  const inCommune = sameTitle.find((c) => cities.has(slugify(c.city ?? "")))
  if (inCommune) return { candidateId: inCommune.id, via: "title+commune" }
  const suffixed = new RegExp(`^${escapeRegExp(title)}-\\d+$`)
  const bySlug =
    candidates.find((c) => c.slug === title) ?? candidates.find((c) => suffixed.test(c.slug))
  return bySlug ? { candidateId: bySlug.id, via: "slug" } : null
}

// Passes, strictest first: exact title + commune, title slug (imports suffix
// duplicates with `-N`), same site with a shared title word, then the only
// event at the same spot. Only events of the same edition are considered, and
// geo passes never reuse a candidate.
export const matchSources = (
  sources: MatchSource[],
  candidates: MatchCandidate[]
): (Match | null)[] => {
  const eligible = sources.map((source) => candidates.filter((c) => sameEdition(source, c)))
  const exact = sources.map((source, index) => exactMatch(source, eligible[index]))
  const used = new Set(exact.filter((m): m is Match => m !== null).map((m) => m.candidateId))

  const nearby = (index: number, radius: number) => {
    const source = sources[index]
    if (!hasPoint(source)) return []
    return eligible[index]
      .filter(hasPoint)
      .filter((c) => !used.has(c.id))
      .map((c) => ({ candidate: c, meters: distanceMeters(source, c) }))
      .filter(({ meters }) => meters <= radius)
  }

  const withTitle = exact.map((match, index) => {
    if (match) return match
    const best = nearby(index, SAME_SITE_METERS)
      .map((hit) => ({ ...hit, score: titleSimilarity(sources[index].title, hit.candidate.title) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.meters - b.meters)[0]
    if (!best) return null
    used.add(best.candidate.id)
    return { candidateId: best.candidate.id, via: "geo+title" as const }
  })

  return withTitle.map((match, index) => {
    if (match) return match
    const spot = nearby(index, SAME_SPOT_METERS)
    if (spot.length !== 1) return null
    used.add(spot[0].candidate.id)
    return { candidateId: spot[0].candidate.id, via: "geo" as const }
  })
}
