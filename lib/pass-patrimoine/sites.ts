import { PASS_PATRIMOINE_SITE_BASE } from "@/lib/pass-patrimoine/url"

export type PassPatrimoineSite = {
  name: string
  city: string
  /** Department code or full postal code, as listed by the pass. */
  postalCode: string
  slug: string
}

/**
 * Normandy partner sites of the Pass Patrimoine, checked on pass-patrimoine.fr
 * on 2026-11-25. Not exhaustive: editors paste the other links by hand. To add
 * a site, append a row (slug = last segment of its /fr/lieux-et-visites/ URL).
 */
export const PASS_PATRIMOINE_NORMANDY_SITES: PassPatrimoineSite[] = [
  { name: "Château de Canon", city: "Mézidon-Canon", postalCode: "14", slug: "chateau-de-canon" },
  {
    name: "Abbaye de Longues",
    city: "Longues-sur-Mer",
    postalCode: "14",
    slug: "abbaye-de-longues",
  },
  {
    name: "Château de Balleroy",
    city: "Balleroy-sur-Drôme",
    postalCode: "14",
    slug: "chateau-de-balleroy",
  },
  { name: "Château de Gratot", city: "Gratot", postalCode: "50", slug: "chateau-de-gratot" },
  {
    name: "Hangar à Dirigeables d'Écausseville",
    city: "Écausseville",
    postalCode: "50",
    slug: "hangar-a-dirigeables-d-ecausseville",
  },
  {
    name: "Airborne Museum",
    city: "Sainte-Mère-Église",
    postalCode: "50480",
    slug: "airborne-museum",
  },
  {
    name: "Château de Bretteville",
    city: "Bretteville-Saint-Laurent",
    postalCode: "76",
    slug: "chateau-de-bretteville",
  },
  {
    name: "Château de Bois-Guilbert",
    city: "Bois-Guilbert",
    postalCode: "76",
    slug: "chateau-de-bois-guilbert",
  },
]

export const passSiteUrl = (site: PassPatrimoineSite) => `${PASS_PATRIMOINE_SITE_BASE}${site.slug}`

export type PassSiteSuggestion = PassPatrimoineSite & {
  url: string
  /** What matched: the site name, its city, or both. */
  reason: "name" | "city" | "both"
  score: number
}

const STOP_WORDS = new Set(["a", "au", "aux", "d", "de", "des", "du", "en", "et", "l", "la", "le"])
const STOP_WORDS_CITY = new Set([...STOP_WORDS, "les", "sur", "sous"])
// Kinds of place: alone they say nothing about which site it is.
const GENERIC_NAME_WORDS = new Set([
  ...STOP_WORDS_CITY,
  "abbaye",
  "chateau",
  "eglise",
  "manoir",
  "musee",
  "museum",
  "hangar",
  "jardins",
  "jardin",
  "parc",
])

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()

const tokens = (value: string, ignored: Set<string>) =>
  normalize(value)
    .split(" ")
    .filter((word) => word.length > 1 && !ignored.has(word))

const editDistance = (a: string, b: string) => {
  const row = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    let previous = row[0]
    row[0] = i
    for (let j = 1; j <= b.length; j++) {
      const current = row[j]
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] === b[j - 1] ? 0 : 1))
      previous = current
    }
  }
  return row[b.length]
}

// Long words tolerate one typo ("Baleroy" for "Balleroy"); short ones must match exactly.
const sameWord = (a: string, b: string) =>
  a === b || (Math.min(a.length, b.length) >= 5 && editDistance(a, b) <= 1)

const shareRatio = (wanted: string[], available: string[]) =>
  wanted.length === 0
    ? 0
    : wanted.filter((word) => available.some((other) => sameWord(word, other))).length /
      wanted.length

type EventPlace = { title: string; location: string; city: string; postalCode?: string | null }

const MIN_SCORE = 0.5

/**
 * Partner sites that look like the event's place, best first. Only a hint for
 * the editor: a city match alone can be a different monument of the same town.
 */
export const suggestPassSites = (
  event: EventPlace,
  sites: PassPatrimoineSite[] = PASS_PATRIMOINE_NORMANDY_SITES,
  limit = 3
): PassSiteSuggestion[] => {
  const placeWords = tokens(`${event.title} ${event.location}`, STOP_WORDS_CITY)
  const cityWords = tokens(`${event.city} ${event.location}`, STOP_WORDS_CITY)
  const department = event.postalCode?.trim().slice(0, 2)

  return sites
    .flatMap((site): PassSiteSuggestion[] => {
      // A homonym town in another department is not this site.
      if (department && !site.postalCode.startsWith(department)) return []
      const nameScore = shareRatio(tokens(site.name, GENERIC_NAME_WORDS), placeWords)
      const cityScore =
        normalize(site.city) === normalize(event.city)
          ? 1
          : shareRatio(tokens(site.city, STOP_WORDS_CITY), cityWords)
      const nameMatch = nameScore >= MIN_SCORE
      const cityMatch = cityScore >= MIN_SCORE
      if (!nameMatch && !cityMatch) return []
      return [
        {
          ...site,
          url: passSiteUrl(site),
          reason: nameMatch && cityMatch ? "both" : nameMatch ? "name" : "city",
          score: nameScore * 0.6 + cityScore * 0.4,
        },
      ]
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
