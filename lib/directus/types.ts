// Subset of the legacy v1 Directus `evenements` collection (public role).
// It mirrors the Tourinsoft syndication of past editions.
export type DirectusHoraire = {
  Datedebut?: string | null
  Datefin?: string | null
  Heureouvert1?: string | null
  Heurefermeture1?: string | null
}

export type DirectusPlace = {
  Lieuprincipal?: string | null
  Commune?: string | null
  Adresse1?: string | null
  Codepostal?: string | null
}

export type DirectusContact = {
  tel?: string | null
  mobile?: string | null
  mail?: string | null
  web?: string | null
}

export type DirectusTarif = {
  Intituletarifs?: string | null
  MinimumEuro?: number | null
  MaximumEuro?: number | null
  Complementtarif?: string | null
}

export type DirectusEvent = {
  id: string
  status: string
  title: string
  description?: string | null
  raison_social?: string | null
  departement?: string | null
  categories?: string[] | null
  datehorairess?: DirectusHoraire[] | null
  lieu_principaux?: DirectusPlace[] | null
  organismes?: DirectusPlace[] | null
  contacts?: DirectusContact[] | null
  tarifs?: DirectusTarif[] | null
  geo?: { type: "Point"; coordinates: [number, number] } | null
  photos?: { directus_files_id?: string | null }[] | null
  syndic_object_id?: string | null
}
