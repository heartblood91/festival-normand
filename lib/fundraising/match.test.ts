import { describe, it, expect } from "vitest"
import { distanceKm, normalizeCommune, suggestCollectes } from "@/lib/fundraising/match"
import type { FondationProject } from "@/lib/fundraising/fondation"

const project = (overrides: Partial<FondationProject>): FondationProject => ({
  code: "1",
  title: "Projet",
  city: "FALAISE",
  postalCode: "14700",
  departmentCode: "14",
  latitude: null,
  longitude: null,
  imageUrl: null,
  collectedPercent: null,
  endDate: null,
  url: "https://www.fondation-patrimoine.org/les-projets/projet/1",
  ...overrides,
})

const falaise = {
  city: "Falaise",
  postalCode: "14700",
  latitude: 48.8952,
  longitude: -0.1963,
}

describe("normalizeCommune", () => {
  it("ignores case, accents, hyphens and the Saint abbreviation", () => {
    expect(normalizeCommune("Saint-Pierre-sur-Dives")).toBe(normalizeCommune("ST PIERRE SUR DIVES"))
    expect(normalizeCommune("Évreux")).toBe("evreux")
  })
})

describe("distanceKm", () => {
  it("measures Caen to Bayeux at about 27 km", () => {
    const km = distanceKm(
      { latitude: 49.1829, longitude: -0.3707 },
      { latitude: 49.2765, longitude: -0.7046 }
    )
    expect(km).toBeGreaterThan(25)
    expect(km).toBeLessThan(28)
  })
})

describe("suggestCollectes", () => {
  it("puts a collect in the same commune first, then the nearest ones in the radius", () => {
    const projects = [
      project({
        code: "far",
        latitude: 49.18,
        longitude: -0.37,
        city: "CAEN",
        postalCode: "14000",
      }),
      project({
        code: "near",
        latitude: 48.93,
        longitude: -0.2,
        city: "VERSAINVILLE",
        postalCode: "14700",
      }),
      project({ code: "same", city: "FALAISE" }),
      project({
        code: "closest",
        latitude: 48.9,
        longitude: -0.19,
        city: "ARON",
        postalCode: "14700",
      }),
    ]

    const suggestions = suggestCollectes(falaise, projects, { radiusKm: 10 })

    expect(suggestions.map((s) => [s.project.code, s.reason])).toEqual([
      ["same", "commune"],
      ["closest", "distance"],
      ["near", "distance"],
    ])
    expect(suggestions[1].distanceKm).toBeLessThan(1)
  })

  it("does not match a homonymous commune in another department", () => {
    const projects = [
      project({ code: "other", city: "FALAISE", postalCode: "08400", departmentCode: "08" }),
    ]
    expect(suggestCollectes(falaise, projects)).toEqual([])
  })

  it("matches by commune only when the event has no coordinates", () => {
    const projects = [
      project({ code: "same" }),
      project({ code: "near", latitude: 48.9, longitude: -0.19, city: "ARON" }),
    ]
    const suggestions = suggestCollectes({ ...falaise, latitude: null, longitude: null }, projects)
    expect(suggestions.map((s) => s.project.code)).toEqual(["same"])
  })

  it("keeps at most `limit` suggestions", () => {
    const projects = Array.from({ length: 6 }, (_, i) =>
      project({ code: String(i), latitude: 48.9 + i / 1000, longitude: -0.19, city: "ARON" })
    )
    expect(suggestCollectes(falaise, projects, { limit: 2 })).toHaveLength(2)
  })
})
