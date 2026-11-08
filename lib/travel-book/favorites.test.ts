import { describe, it, expect } from "vitest"
import {
  MAX_FAVORITES,
  groupTravelBook,
  normalizeEventIds,
  parseFavorites,
  toggleFavorite,
} from "@/lib/travel-book/favorites"
import { travelBookKey } from "@/lib/travel-book/key"

describe("parseFavorites", () => {
  it("reads a stored JSON list and drops anything that is not an event id", () => {
    expect(parseFavorites('["a1", "b2", "a1", 3, "bad id", ""]')).toEqual(["a1", "b2"])
  })

  it("returns an empty list for missing or corrupted storage", () => {
    expect(parseFavorites(null)).toEqual([])
    expect(parseFavorites("{not json")).toEqual([])
    expect(parseFavorites('{"a": 1}')).toEqual([])
  })
})

describe("toggleFavorite", () => {
  it("adds a missing event and removes a present one", () => {
    expect(toggleFavorite(["a"], "b")).toEqual(["a", "b"])
    expect(toggleFavorite(["a", "b"], "a")).toEqual(["b"])
  })

  it("never keeps more than the maximum, dropping the oldest", () => {
    const full = Array.from({ length: MAX_FAVORITES }, (_, i) => `e${i}`)
    const next = toggleFavorite(full, "new")
    expect(next).toHaveLength(MAX_FAVORITES)
    expect(next[0]).toBe("e1")
    expect(next.at(-1)).toBe("new")
  })
})

describe("normalizeEventIds / travelBookKey", () => {
  it("dedupes, validates and sorts ids so the same selection shares one link", () => {
    expect(normalizeEventIds(["b", "a", "b", "x y"])).toEqual(["a", "b"])
    expect(travelBookKey(["b", "a"])).toBe(travelBookKey(["a", "b", "a"]))
    expect(travelBookKey(["a"])).not.toBe(travelBookKey(["a", "b"]))
  })
})

describe("groupTravelBook", () => {
  const events = [
    { id: "1", city: "Rouen", dateStart: "2027-05-22T18:00:00.000Z", timeStart: "21:00" },
    { id: "2", city: "Caen", dateStart: "2027-05-21T18:00:00.000Z", timeStart: "22:00" },
    { id: "3", city: "Bayeux", dateStart: "2027-05-21T18:00:00.000Z", timeStart: "20:30" },
    { id: "4", city: null, dateStart: null, timeStart: null },
  ]

  it("groups by day in date order, then by start time", () => {
    const groups = groupTravelBook(events, "date", "fr")
    expect(groups.map((g) => g.events.map((e) => e.id))).toEqual([["3", "2"], ["1"], ["4"]])
    expect(groups[0].label).toMatch(/vendredi 21 mai/i)
    expect(groups.at(-1)?.label).toBeNull()
  })

  it("groups by commune alphabetically", () => {
    const groups = groupTravelBook(events, "place", "fr")
    expect(groups.map((g) => g.label)).toEqual(["Bayeux", "Caen", "Rouen", null])
  })
})
