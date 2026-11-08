import { describe, it, expect } from "vitest"
import { directusEdition, mapDirectusEvent, toMatchSource } from "./map"
import type { DirectusEvent } from "./types"

const record: DirectusEvent = {
  id: "004d9001",
  status: "published",
  title: "Visite nocturne, à la bougie, de l'église de Grangues",
  description: "L'église de Grangues sera exceptionnellement ouverte.",
  raison_social: "Mairie",
  departement: "Calvados",
  categories: ["Illuminations", "Visite"],
  datehorairess: [
    {
      Datedebut: "2026-05-30T00:00:00",
      Datefin: "2026-05-30T00:00:00",
      Heureouvert1: "21:00:00",
      Heurefermeture1: "23:00:00",
    },
  ],
  lieu_principaux: [{ Lieuprincipal: "GRANGUES", Adresse1: "L'Église", Codepostal: "14160" }],
  organismes: [{ Commune: "GRANGUES", Adresse1: "1378 Route de l'Église", Codepostal: "14160" }],
  contacts: [{ tel: "", mobile: "0600000000", mail: "contact@example.org", web: null }],
  tarifs: [{ Intituletarifs: "Gratuit", Complementtarif: "pour tous", MinimumEuro: null }],
  geo: { type: "Point", coordinates: [-0.0570388, 49.26592] },
  photos: [{ directus_files_id: "file-a" }, { directus_files_id: null }],
  syndic_object_id: "FMANOR014V56EX82",
}

describe("mapDirectusEvent", () => {
  it("maps a v1 record to the import shape", () => {
    const mapped = mapDirectusEvent(record)
    expect(mapped).toMatchObject({
      tourinsoftId: "FMANOR014V56EX82",
      slug: "visite-nocturne-a-la-bougie-de-l-eglise-de-grangues",
      city: "Grangues",
      postalCode: "14160",
      location: "L'Église",
      department: "CALVADOS",
      category: "VISITES",
      timeStart: "21:00",
      timeEnd: "23:00",
      pricingFr: "Gratuit (pour tous)",
      organizer: "Mairie",
      phone: "0600000000",
      latitude: 49.26592,
      longitude: -0.0570388,
      dateStart: new Date("2026-05-30T00:00:00"),
    })
    expect(mapped.photos).toEqual([
      {
        url: "https://pierresenlumieres.fr/backend/assets/file-a",
        credit: null,
        title: null,
        order: 1,
      },
    ])
  })

  it("falls back to a synthetic id when the record has no Tourinsoft id", () => {
    expect(mapDirectusEvent({ ...record, syndic_object_id: null }).tourinsoftId).toBe(
      "directus-004d9001"
    )
  })

  it("rejects a record without start date", () => {
    expect(() => mapDirectusEvent({ ...record, datehorairess: [] })).toThrow()
  })

  it("derives the edition from the first date slot", () => {
    expect(directusEdition(record)).toBe("2026")
  })
})

describe("toMatchSource", () => {
  it("keeps both communes and the GeoJSON point as lat/lng", () => {
    expect(toMatchSource(record)).toEqual({
      title: record.title,
      cities: ["GRANGUES", "GRANGUES"],
      latitude: 49.26592,
      longitude: -0.0570388,
      dateStart: new Date("2026-05-30T00:00:00"),
    })
  })
})
