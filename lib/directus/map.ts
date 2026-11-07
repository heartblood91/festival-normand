import { Category, Department } from "@prisma/client"
import { slugify } from "@/lib/schemas/event"
import { normalizeNormandyCoordinates } from "@/lib/geo/normandy"
import type { MappedOffer } from "@/lib/tourinsoft/map"
import type { MatchSource } from "./match"
import type { DirectusEvent, DirectusTarif } from "./types"

export const DIRECTUS_BASE_URL = "https://pierresenlumieres.fr/backend"

const clean = (value: string | null | undefined): string | null => {
  const trimmed = (value ?? "").trim()
  return trimmed === "" || trimmed.toLowerCase() === "null" ? null : trimmed
}

const DEPARTMENT_BY_LABEL: Record<string, Department> = {
  Calvados: Department.CALVADOS,
  Eure: Department.EURE,
  Manche: Department.MANCHE,
  Orne: Department.ORNE,
  "Seine-Maritime": Department.SEINE_MARITIME,
}

// Same priority as the Tourinsoft import: the most specific category wins.
const CATEGORY_RULES: [RegExp, Category][] = [
  [/exposition/i, Category.EXPOSITIONS],
  [/animation|spectacle/i, Category.ANIMATIONS],
  [/visite/i, Category.VISITES],
  [/illumination|lumi[eè]re/i, Category.ILLUMINATIONS],
]

const mapCategory = (categories: string[] | null | undefined): Category => {
  const labels = (categories ?? []).join(" ")
  return CATEGORY_RULES.find(([pattern]) => pattern.test(labels))?.[1] ?? Category.ANIMATIONS
}

const composePricing = (tarifs: DirectusTarif[] | null | undefined): string | null => {
  const parts = (tarifs ?? [])
    .map((tarif) => {
      const min = tarif.MinimumEuro ?? null
      const max = tarif.MaximumEuro ?? null
      const amount =
        min !== null && max !== null && min !== max
          ? `${min}–${max} €`
          : min !== null
            ? `${min} €`
            : null
      const head = [amount, clean(tarif.Intituletarifs)].filter(Boolean).join(" ")
      const complement = clean(tarif.Complementtarif)
      return complement ? `${head} (${complement})`.trim() : head
    })
    .filter((part) => part.length > 0)
  return parts.length > 0 ? parts.join(", ") : null
}

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .replace(
      /(^|[\s'-])([a-zà-ÿ])/g,
      (_, separator: string, char: string) => separator + char.toUpperCase()
    )

export const directusAssetUrl = (fileId: string) => `${DIRECTUS_BASE_URL}/assets/${fileId}`

// Edition = year of the first date slot.
export const directusEdition = (event: DirectusEvent): string | null =>
  clean(event.datehorairess?.[0]?.Datedebut)?.slice(0, 4) ?? null

// Map a v1 record to the shape the Tourinsoft import already persists, so the
// recovery reuses the same create path (photos, unique slug, coordinates).
export const mapDirectusEvent = (event: DirectusEvent): MappedOffer => {
  const titleFr = clean(event.title)
  const horaire = event.datehorairess?.[0]
  const start = clean(horaire?.Datedebut)
  if (!titleFr || !start) {
    throw new Error(`Directus event ${event.id} has no title or start date`)
  }

  const end = clean(horaire?.Datefin)
  const lieu = event.lieu_principaux?.[0]
  const organisme = event.organismes?.[0]
  const contact = event.contacts?.[0]
  const rawCity = clean(lieu?.Lieuprincipal) ?? clean(organisme?.Commune)
  const city = rawCity ? toTitleCase(rawCity) : "Inconnu"
  const postalCode = clean(lieu?.Codepostal) ?? clean(organisme?.Codepostal) ?? "00000"
  const coordinates = normalizeNormandyCoordinates({
    latitude: event.geo?.coordinates?.[1] ?? null,
    longitude: event.geo?.coordinates?.[0] ?? null,
  })

  return {
    tourinsoftId: clean(event.syndic_object_id) ?? `directus-${event.id}`,
    titleFr,
    slug: slugify(titleFr) || "evenement",
    descriptionFr: clean(event.description) ?? titleFr,
    location: clean(lieu?.Adresse1) ?? clean(organisme?.Adresse1) ?? city,
    city,
    postalCode,
    department: DEPARTMENT_BY_LABEL[clean(event.departement) ?? ""] ?? Department.CALVADOS,
    category: mapCategory(event.categories),
    tourinsoftCategories: (event.categories ?? []).join(", ") || null,
    tourinsoftUpdatedAt: null,
    dateStart: new Date(start),
    dateEnd: end ? new Date(end) : null,
    timeStart: clean(horaire?.Heureouvert1)?.slice(0, 5) ?? null,
    timeEnd: clean(horaire?.Heurefermeture1)?.slice(0, 5) ?? null,
    pricingFr: composePricing(event.tarifs),
    organizer: clean(event.raison_social),
    email: clean(contact?.mail),
    phone: clean(contact?.tel) ?? clean(contact?.mobile),
    website: clean(contact?.web),
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    photos: (event.photos ?? [])
      .map((photo) => clean(photo.directus_files_id))
      .filter((id): id is string => id !== null)
      .map((id, index) => ({
        url: directusAssetUrl(id),
        credit: null,
        title: null,
        order: index + 1,
      })),
  }
}

// What the matcher needs to recognise a v1 record on the new site.
export const toMatchSource = (event: DirectusEvent): MatchSource => {
  const start = clean(event.datehorairess?.[0]?.Datedebut)
  return {
    title: event.title,
    cities: [event.lieu_principaux?.[0]?.Lieuprincipal, event.organismes?.[0]?.Commune]
      .map((city) => clean(city))
      .filter((city): city is string => city !== null),
    latitude: event.geo?.coordinates?.[1] ?? null,
    longitude: event.geo?.coordinates?.[0] ?? null,
    dateStart: start ? new Date(start) : null,
  }
}
