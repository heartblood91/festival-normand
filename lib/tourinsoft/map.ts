import { Category, Department } from "@prisma/client"
import { normalizeFranceCoordinates } from "@/lib/geo/france"
import { slugify } from "@/lib/schemas/event"
import type {
  TourinsoftContact,
  TourinsoftOffer,
  TourinsoftPhoto,
  TourinsoftThesaurusItem,
} from "./types"

export type MappedPhoto = {
  url: string
  credit: string | null
  title: string | null
  order: number
}

export type MappedOffer = {
  tourinsoftId: string
  titleFr: string
  slug: string
  descriptionFr: string
  location: string
  city: string
  postalCode: string
  department: Department
  category: Category
  tourinsoftCategories: string | null
  tourinsoftUpdatedAt: Date | null
  dateStart: Date
  dateEnd: Date | null
  timeStart: string | null
  timeEnd: string | null
  pricingFr: string | null
  organizer: string | null
  email: string | null
  phone: string | null
  website: string | null
  latitude: number | null
  longitude: number | null
  photos: MappedPhoto[]
}

// Tourinsoft sometimes serializes empty values as the literal string "null".
const clean = (value: string | null | undefined): string | null => {
  const trimmed = (value ?? "").trim()
  return trimmed === "" || trimmed.toLowerCase() === "null" ? null : trimmed
}

const INSEE_DEPARTMENT: Record<string, Department> = {
  "14": Department.CALVADOS,
  "27": Department.EURE,
  "50": Department.MANCHE,
  "61": Department.ORNE,
  "76": Department.SEINE_MARITIME,
}

// Tourinsoft has no department field; derive it from the INSEE code (or postal
// code) prefix. Defaults to CALVADOS so the draft is always insertable.
const mapDepartment = (insee: string | null | undefined, postalCode: string | null): Department => {
  const prefix = (clean(insee) ?? clean(postalCode) ?? "").slice(0, 2)
  return INSEE_DEPARTMENT[prefix] ?? Department.CALVADOS
}

// Hardcoded mapping of Tourinsoft category codes to our enum (4→4, stable).
const CATEGORY_BY_CODE: Record<string, Category> = {
  ILLUM: Category.ILLUMINATIONS,
  N0002: Category.VISITES,
  ANIMVIV: Category.ANIMATIONS,
  EXPOS: Category.EXPOSITIONS,
}

// One category per event (v1). When an offer has several, keep the most specific
// so the listing stays balanced — 205/312 offers carry ILLUM.
const CATEGORY_PRIORITY: Category[] = [
  Category.EXPOSITIONS,
  Category.ANIMATIONS,
  Category.VISITES,
  Category.ILLUMINATIONS,
]

const mapCategory = (categories: TourinsoftThesaurusItem[] | null | undefined): Category => {
  const mapped = new Set(
    (categories ?? [])
      .map((c) => (c.ThesCode ? CATEGORY_BY_CODE[c.ThesCode] : undefined))
      .filter((c): c is Category => c !== undefined)
  )
  return CATEGORY_PRIORITY.find((category) => mapped.has(category)) ?? Category.ANIMATIONS
}

const normalizeTime = (time: string | null | undefined): string | null => {
  const cleaned = clean(time)
  return cleaned ? cleaned.slice(0, 5) : null
}

// "DOUVRES-LA-DELIVRANDE" → "Douvres-La-Delivrande" (best-effort; admin can fix).
const toTitleCase = (value: string | null): string | null => {
  if (!value) return null
  return value
    .toLowerCase()
    .replace(
      /(^|[\s'-])([a-zà-ÿ])/g,
      (_, separator: string, char: string) => separator + char.toUpperCase()
    )
}

const parseCoord = (value: string | null | undefined): number | null => {
  const cleaned = clean(value)
  if (!cleaned) return null
  const num = Number(cleaned.replace(",", "."))
  return Number.isFinite(num) ? num : null
}

const firstContact = (contacts: TourinsoftContact[] | null | undefined): string | null =>
  clean(contacts?.[0]?.CoordonneesTelecom)

// Build a human pricing line, e.g. "5 € Tarif réduit (tarif unique), Gratuit (moins de 10 ans)".
const composePricing = (tarifs: TourinsoftOffer["Tarifs"]): string | null => {
  const parts = (tarifs ?? [])
    .map((t) => {
      const label = clean(t.Intituletarifs?.ThesLibelle)
      const min = t.MinimumEuro ?? null
      const max = t.MaximumEuro ?? null
      let amount: string | null = null
      if (min !== null && max !== null) {
        amount = min === max ? `${min} €` : `${min}–${max} €`
      } else if (min !== null) {
        amount = `${min} €`
      }
      const complement = clean(t.Complementtarif)
      const head = [amount, label].filter(Boolean).join(" ")
      return complement ? `${head} (${complement})`.trim() : head
    })
    .filter((part) => part.length > 0)
  return parts.length > 0 ? parts.join(", ") : null
}

const mapPhotos = (photoss: TourinsoftPhoto[] | null | undefined): MappedPhoto[] =>
  (photoss ?? [])
    .map((photo, index): MappedPhoto | null => {
      const url = clean(photo.Photo?.Url)
      if (!url) return null
      return {
        url,
        credit: clean(photo.Photo?.Credit),
        title: clean(photo.Photo?.Titre),
        order: photo.Ordre ?? index + 1,
      }
    })
    .filter((photo): photo is MappedPhoto => photo !== null)

// Pure mapping of one raw offer to our Event shape. Photos keep their remote URL;
// downloading/persisting happens in the sync route, not here.
export const mapOffer = (offer: TourinsoftOffer): MappedOffer => {
  const tourinsoftId = clean(offer.SyndicObjectID)
  const titleFr = clean(offer.NomOffre)
  if (!tourinsoftId || !titleFr) {
    throw new Error("Tourinsoft offer missing SyndicObjectID or NomOffre")
  }

  const lieu = offer.LieuPrincipals?.[0]
  const organisme = offer.Organismes?.[0]
  const horaire = offer.DateHorairess?.[0]

  const city = toTitleCase(clean(lieu?.Lieuprincipal) ?? clean(organisme?.Commune)) ?? "Inconnu"
  const postalCode = clean(lieu?.Codepostal) ?? clean(organisme?.Codepostal) ?? "00000"
  const location = clean(lieu?.Adresse1) ?? clean(organisme?.Adresse1) ?? city

  const categoriesText = (offer.Categories ?? [])
    .map((c) => clean(c.ThesLibelle))
    .filter(Boolean)
    .join(", ")
  const coordinates = normalizeFranceCoordinates({
    latitude: parseCoord(offer.GmapLatitude) ?? parseCoord(offer.Latitude),
    longitude: parseCoord(offer.GmapLongitude) ?? parseCoord(offer.Longitude),
  })

  return {
    tourinsoftId,
    titleFr,
    slug: slugify(titleFr),
    descriptionFr: clean(offer.Descriptif) ?? clean(offer.DescriptifCourt) ?? titleFr,
    location,
    city,
    postalCode,
    department: mapDepartment(offer.Insee, postalCode),
    category: mapCategory(offer.Categories),
    tourinsoftCategories: categoriesText.length > 0 ? categoriesText : null,
    tourinsoftUpdatedAt: offer.Updated ? new Date(offer.Updated) : null,
    dateStart: horaire?.Datedebut ? new Date(horaire.Datedebut) : new Date(),
    dateEnd: horaire?.Datefin ? new Date(horaire.Datefin) : null,
    timeStart: normalizeTime(horaire?.Heureouvert1),
    timeEnd: normalizeTime(horaire?.Heurefermeture1),
    pricingFr: composePricing(offer.Tarifs),
    organizer: clean(offer.RaisonSocial),
    email: firstContact(offer.ContactMails),
    phone: firstContact(offer.ContactTels) ?? firstContact(offer.ContactMobils),
    website: firstContact(offer.ContactWebs),
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    photos: mapPhotos(offer.Photoss),
  }
}
