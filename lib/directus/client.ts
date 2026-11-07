import { DIRECTUS_BASE_URL } from "./map"
import type { DirectusEvent } from "./types"

const FIELDS = [
  "id",
  "status",
  "title",
  "description",
  "raison_social",
  "departement",
  "categories",
  "datehorairess",
  "lieu_principaux",
  "organismes",
  "contacts",
  "tarifs",
  "geo",
  "photos.directus_files_id",
  "syndic_object_id",
].join(",")
const PAGE_SIZE = 200
const PAGE_DELAY_MS = 500

// The public role ignores `filter[...]`: fetch everything and filter client-side.
export const fetchDirectusEvents = async (): Promise<DirectusEvent[]> => {
  const all: DirectusEvent[] = []
  for (let offset = 0; ; offset += PAGE_SIZE) {
    const response = await fetch(
      `${DIRECTUS_BASE_URL}/items/evenements?limit=${PAGE_SIZE}&offset=${offset}&fields=${FIELDS}`
    )
    if (!response.ok) throw new Error(`Directus error: ${response.status}`)
    const batch = ((await response.json()) as { data: DirectusEvent[] }).data
    all.push(...batch)
    if (batch.length < PAGE_SIZE) return all
    await new Promise((resolve) => setTimeout(resolve, PAGE_DELAY_MS))
  }
}
