import type { MappedOffer } from "./map"

type SyncedField = Exclude<
  keyof MappedOffer,
  "tourinsoftId" | "slug" | "tourinsoftCategories" | "tourinsoftUpdatedAt"
>

/**
 * Fields the sync overwrites whenever the Tourinsoft offer changes upstream
 * (see `updateEvent` in ./sync). Typed against MappedOffer so a new mapped
 * field cannot be forgotten here. EN fields follow through auto-translation.
 */
export const TOURINSOFT_SYNCED_FIELDS: Record<SyncedField, string> = {
  titleFr: "Titre (FR)",
  descriptionFr: "Description (FR)",
  location: "Lieu",
  city: "Ville",
  postalCode: "Code postal",
  department: "Département",
  category: "Catégorie",
  dateStart: "Date de début",
  dateEnd: "Date de fin",
  timeStart: "Heure de début",
  timeEnd: "Heure de fin",
  pricingFr: "Tarifs (FR)",
  organizer: "Organisateur",
  email: "E-mail",
  phone: "Téléphone",
  website: "Site web",
  latitude: "Latitude",
  longitude: "Longitude",
  photos: "Photos et image de couverture",
}

export const syncedFieldsSummary = (): string => {
  const labels = Object.values(TOURINSOFT_SYNCED_FIELDS)
  return `${labels.slice(0, -1).join(", ")} et ${labels.at(-1)}`
}
