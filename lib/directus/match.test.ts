import { describe, it, expect } from "vitest"
import { distanceMeters, matchSources, titleSimilarity, type MatchCandidate } from "./match"

const candidate = (overrides: Partial<MatchCandidate> & { id: string }): MatchCandidate => ({
  title: overrides.id,
  slug: overrides.id,
  city: null,
  latitude: null,
  longitude: null,
  dateStart: null,
  ...overrides,
})

// Église Saint-Ouen, Offranville, and a point ~30 m away.
const OFFRANVILLE = { latitude: 49.8712, longitude: 1.0482 }
const NEAR = { latitude: 49.8714, longitude: 1.0485 }

describe("directus matching", () => {
  it("measures distances in metres", () => {
    expect(distanceMeters(OFFRANVILLE, NEAR)).toBeGreaterThan(20)
    expect(distanceMeters(OFFRANVILLE, NEAR)).toBeLessThan(40)
  })

  it("ignores festival boilerplate when comparing titles", () => {
    expect(titleSimilarity("Pierres en Lumières 2026 en l'église", "Pierres en lumières")).toBe(0)
    expect(
      titleSimilarity("Le Bosc Féré en lumières au Thuit de l'Oison", "Le Bosc Féré en lumières")
    ).toBeGreaterThan(0.4)
  })

  it("matches by title + commune, then title slug with a numeric suffix", () => {
    const result = matchSources(
      [
        { title: "Lumières à Agy", cities: ["AGY"], latitude: null, longitude: null },
        { title: "Château de Canon", cities: [], latitude: null, longitude: null },
      ],
      [
        candidate({ id: "a", title: "Lumières à Agy", slug: "lumieres-a-agy", city: "Agy" }),
        candidate({ id: "b", title: "Château de Canon", slug: "chateau-de-canon-2", city: "" }),
      ]
    )
    expect(result).toEqual([
      { candidateId: "a", via: "title+commune" },
      { candidateId: "b", via: "slug" },
    ])
  })

  it("matches a renamed event at the same place when titles share a word", () => {
    const [match] = matchSources(
      [{ title: "Le Bosc Féré en lumières au Thuit de l'Oison", cities: [], ...OFFRANVILLE }],
      [
        candidate({ id: "other", title: "Concert", ...NEAR }),
        candidate({ id: "bosc", title: "Le Bosc Féré en lumières", ...NEAR }),
      ]
    )
    expect(match).toEqual({ candidateId: "bosc", via: "geo+title" })
  })

  it("matches the only event at the same spot even with a different title", () => {
    const [match] = matchSources(
      [{ title: "Pierres en lumières", cities: [], ...OFFRANVILLE }],
      [candidate({ id: "eglise", title: "Église Saint-Côme", ...NEAR })]
    )
    expect(match).toEqual({ candidateId: "eglise", via: "geo" })
  })

  it("never assigns one geo candidate to two sources", () => {
    const result = matchSources(
      [
        { title: "Concert", cities: [], ...OFFRANVILLE },
        { title: "Illumination", cities: [], ...OFFRANVILLE },
      ],
      [candidate({ id: "eglise", title: "Église", ...NEAR })]
    )
    expect(result.filter(Boolean)).toHaveLength(1)
  })

  it("does not match by place when two different events share the spot", () => {
    const [match] = matchSources(
      [{ title: "Visite", cities: [], ...OFFRANVILLE }],
      [
        candidate({ id: "x", title: "Concert", ...NEAR }),
        candidate({ id: "y", title: "Exposition", ...NEAR }),
      ]
    )
    expect(match).toBeNull()
  })
  it("ignores events of another edition", () => {
    const [match] = matchSources(
      [
        {
          title: "Lumières à Agy",
          cities: ["AGY"],
          latitude: null,
          longitude: null,
          dateStart: new Date("2026-05-29"),
        },
      ],
      [
        candidate({
          id: "a",
          title: "Lumières à Agy",
          slug: "lumieres-a-agy",
          city: "AGY",
          dateStart: new Date("2025-05-23"),
        }),
      ]
    )
    expect(match).toBeNull()
  })

  it("tolerates the Paris-midnight UTC shift within an edition", () => {
    const [match] = matchSources(
      [
        {
          title: "Lumières à Agy",
          cities: ["AGY"],
          latitude: null,
          longitude: null,
          dateStart: new Date("2026-05-29T00:00:00"),
        },
      ],
      [
        candidate({
          id: "a",
          title: "Lumières à Agy",
          slug: "lumieres-a-agy",
          city: "AGY",
          dateStart: new Date("2026-05-28T22:00:00Z"),
        }),
      ]
    )
    expect(match).toEqual({ candidateId: "a", via: "title+commune" })
  })
})
