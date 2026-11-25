import { describe, it, expect } from "vitest"
import { PASS_PATRIMOINE_NORMANDY_SITES, suggestPassSites } from "./sites"
import { normalizePassPatrimoineUrl } from "./url"

const place = (title: string, location: string, city: string, postalCode = "") => ({
  title,
  location,
  city,
  postalCode,
})

describe("PASS_PATRIMOINE_NORMANDY_SITES", () => {
  it("only lists valid partner pages", () => {
    for (const site of PASS_PATRIMOINE_NORMANDY_SITES) {
      const url = `https://www.pass-patrimoine.fr/fr/lieux-et-visites/${site.slug}`
      expect(normalizePassPatrimoineUrl(url)).toBe(url)
    }
  })
})

describe("suggestPassSites", () => {
  it("matches the site name in the event title, ignoring accents and case", () => {
    const [first] = suggestPassSites(
      place(
        "Nuit illuminée au CHATEAU DE CANON",
        "Parc du château",
        "Mézidon Vallée d'Auge",
        "14270"
      )
    )
    expect(first.slug).toBe("chateau-de-canon")
    expect(first.reason).toBe("both")
    expect(first.url).toBe("https://www.pass-patrimoine.fr/fr/lieux-et-visites/chateau-de-canon")
  })

  it("matches on the city alone", () => {
    const [first] = suggestPassSites(
      place("Veillée aux lampions", "Place du 6 juin", "Sainte-Mère-Église", "50480")
    )
    expect(first).toMatchObject({ slug: "airborne-museum", reason: "city" })
  })

  it("tolerates a one-letter typo in a long word", () => {
    const [first] = suggestPassSites(place("Château de Baleroy", "", "Balleroy"))
    expect(first.slug).toBe("chateau-de-balleroy")
  })

  it("does not match on a generic word such as château", () => {
    expect(suggestPassSites(place("Château de Caen", "Château", "Caen", "14000"))).toEqual([])
  })

  it("drops sites of another department", () => {
    expect(suggestPassSites(place("Château de Gratot", "", "Gratot", "14000"))).toEqual([])
    expect(suggestPassSites(place("Château de Gratot", "", "Gratot", "50200"))[0].slug).toBe(
      "chateau-de-gratot"
    )
  })

  it("ranks a name and city match above a city-only one and caps the list", () => {
    const sites = [
      { name: "Abbaye de Longues", city: "Longues-sur-Mer", postalCode: "14", slug: "a" },
      { name: "Phare de Longues", city: "Longues-sur-Mer", postalCode: "14", slug: "b" },
    ]
    const result = suggestPassSites(place("Abbaye de Longues", "", "Longues-sur-Mer"), sites, 1)
    expect(result.map((site) => site.slug)).toEqual(["a"])
  })

  it("suggests nothing for an unrelated place", () => {
    expect(
      suggestPassSites(place("Illumination de l'église", "Église", "Évreux", "27000"))
    ).toEqual([])
  })
})
