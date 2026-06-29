import { describe, it, expect } from "vitest"
import { Category, Department } from "@prisma/client"
import { mapOffer } from "./map"
import type { TourinsoftOffer } from "./types"

const baseOffer: TourinsoftOffer = {
  SyndicObjectID: "FMANOR014V54P83G",
  NomOffre: "Pierres en Lumière sur la station Radar 44",
  Descriptif: 'Dans le cadre de "Pierres en Lumières", visitez le musée à tarif préférentiel.',
  Insee: "14228",
  Categories: [
    { ThesCode: "ILLUM", ThesLibelle: "Illuminations" },
    { ThesCode: "N0002", ThesLibelle: "Visite" },
  ],
  LieuPrincipals: [
    {
      Adresse1: "Station Radar 44",
      Codepostal: "14440",
      Lieuprincipal: "DOUVRES-LA-DELIVRANDE",
    },
  ],
  DateHorairess: [
    {
      Datedebut: "2026-05-30T00:00:00",
      Datefin: "2026-05-30T00:00:00",
      Heureouvert1: "20:00:00",
      Heurefermeture1: "22:45:00",
    },
  ],
  Tarifs: [
    {
      MinimumEuro: 5,
      MaximumEuro: 5,
      Complementtarif: "tarif unique",
      Intituletarifs: { ThesCode: "REDUI", ThesLibelle: "Tarif réduit" },
    },
    {
      MinimumEuro: null,
      MaximumEuro: null,
      Complementtarif: "moins de 10 ans",
      Intituletarifs: { ThesCode: "GRAT", ThesLibelle: "Gratuit" },
    },
  ],
  ContactMails: [{ CoordonneesTelecom: "amismuseeradar@gmail.com" }],
  ContactWebs: [{ CoordonneesTelecom: "https://www.musee-radar.fr" }],
  RaisonSocial: "Association des Amis du Musée Radar",
  Latitude: null,
  Longitude: "-0.40279",
  GmapLatitude: "49.28571",
  GmapLongitude: "-0.40279",
  Photoss: [
    {
      Ordre: 1,
      Photo: {
        MediaID: "9f00352a-d5cf-4e01-b020-9ded0c84716d",
        Titre: "Nocturne Station radar 44",
        Credit: "Constance Duquesnay",
        Url: "https://normandie.media.tourinsoft.eu/upload/Nocturne-Station-radar-44.jpg",
      },
    },
  ],
}

describe("mapOffer", () => {
  it("maps the core fields of a full offer", () => {
    const result = mapOffer(baseOffer)
    expect(result.tourinsoftId).toBe("FMANOR014V54P83G")
    expect(result.titleFr).toBe("Pierres en Lumière sur la station Radar 44")
    expect(result.slug).toBe("pierres-en-lumiere-sur-la-station-radar-44")
    expect(result.location).toBe("Station Radar 44")
    expect(result.postalCode).toBe("14440")
    expect(result.organizer).toBe("Association des Amis du Musée Radar")
    expect(result.email).toBe("amismuseeradar@gmail.com")
    expect(result.website).toBe("https://www.musee-radar.fr")
  })

  it("derives the department from the INSEE prefix", () => {
    expect(mapOffer(baseOffer).department).toBe(Department.CALVADOS)
    expect(mapOffer({ ...baseOffer, Insee: "76540" }).department).toBe(Department.SEINE_MARITIME)
    expect(mapOffer({ ...baseOffer, Insee: "50001" }).department).toBe(Department.MANCHE)
  })

  it("falls back to the postal code when INSEE is missing", () => {
    const result = mapOffer({ ...baseOffer, Insee: null })
    expect(result.department).toBe(Department.CALVADOS)
  })

  it("maps category by Tourinsoft code, most specific first", () => {
    // baseOffer has ILLUM + Visite → VISITES wins (more specific than Illuminations)
    expect(mapOffer(baseOffer).category).toBe(Category.VISITES)
    expect(
      mapOffer({ ...baseOffer, Categories: [{ ThesCode: "EXPOS", ThesLibelle: "Exposition" }] })
        .category
    ).toBe(Category.EXPOSITIONS)
    expect(
      mapOffer({ ...baseOffer, Categories: [{ ThesCode: "ILLUM", ThesLibelle: "Illuminations" }] })
        .category
    ).toBe(Category.ILLUMINATIONS)
    expect(
      mapOffer({ ...baseOffer, Categories: [{ ThesCode: "ANIMVIV", ThesLibelle: "Animations" }] })
        .category
    ).toBe(Category.ANIMATIONS)
    // unknown code → ANIMATIONS fallback
    expect(
      mapOffer({ ...baseOffer, Categories: [{ ThesCode: "XXXX", ThesLibelle: "?" }] }).category
    ).toBe(Category.ANIMATIONS)
  })

  it("keeps the raw category labels as info text", () => {
    expect(mapOffer(baseOffer).tourinsoftCategories).toBe("Illuminations, Visite")
  })

  it("title-cases the uppercase city name", () => {
    expect(mapOffer(baseOffer).city).toBe("Douvres-La-Delivrande")
  })

  it("normalizes times to HH:mm", () => {
    const result = mapOffer(baseOffer)
    expect(result.timeStart).toBe("20:00")
    expect(result.timeEnd).toBe("22:45")
  })

  it("composes a pricing line from Tarifs", () => {
    expect(mapOffer(baseOffer).pricingFr).toBe(
      "5 € Tarif réduit (tarif unique), Gratuit (moins de 10 ans)"
    )
  })

  it("prefers Gmap coordinates and parses comma decimals", () => {
    const result = mapOffer({
      ...baseOffer,
      GmapLatitude: "49,5",
      GmapLongitude: null,
      Latitude: "48",
      Longitude: "1",
    })
    expect(result.latitude).toBe(49.5)
    expect(result.longitude).toBe(1)
  })

  it("drops coordinates outside Normandy bounds", () => {
    const result = mapOffer({
      ...baseOffer,
      GmapLatitude: "45.8965683",
      GmapLongitude: "-74.153834",
      Latitude: null,
      Longitude: null,
    })
    expect(result.latitude).toBeNull()
    expect(result.longitude).toBeNull()
  })

  it("drops coordinates in France but outside Normandy bounds", () => {
    const result = mapOffer({
      ...baseOffer,
      GmapLatitude: "46.485445",
      GmapLongitude: "4.13739",
      Latitude: null,
      Longitude: null,
    })
    expect(result.latitude).toBeNull()
    expect(result.longitude).toBeNull()
  })

  it("maps photos with credit and title", () => {
    const photos = mapOffer(baseOffer).photos
    expect(photos).toHaveLength(1)
    expect(photos[0]).toEqual({
      url: "https://normandie.media.tourinsoft.eu/upload/Nocturne-Station-radar-44.jpg",
      credit: "Constance Duquesnay",
      title: "Nocturne Station radar 44",
      order: 1,
    })
  })

  it('treats the literal string "null" as empty and falls back', () => {
    const result = mapOffer({ ...baseOffer, Descriptif: "null", DescriptifCourt: "  " })
    expect(result.descriptionFr).toBe(baseOffer.NomOffre)
  })

  it("handles an offer with no photos", () => {
    expect(mapOffer({ ...baseOffer, Photoss: null }).photos).toEqual([])
  })

  it("parses Updated into tourinsoftUpdatedAt", () => {
    const result = mapOffer({ ...baseOffer, Updated: "2026-05-28T10:07:18" })
    expect(result.tourinsoftUpdatedAt?.toISOString()).toBe(
      new Date("2026-05-28T10:07:18").toISOString()
    )
    expect(mapOffer({ ...baseOffer, Updated: null }).tourinsoftUpdatedAt).toBeNull()
  })

  it("throws when SyndicObjectID or NomOffre is missing", () => {
    expect(() => mapOffer({ ...baseOffer, SyndicObjectID: null })).toThrow()
    expect(() => mapOffer({ ...baseOffer, NomOffre: "  " })).toThrow()
  })
})
