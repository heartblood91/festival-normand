import { describe, it, expect } from "vitest"
import { pickNearbySuggestions, sharesADay } from "./nearby"

const at = (day: string, time = "20:00") => new Date(`${day}T${time}:00`).toISOString()

const place = (
  slug: string,
  distanceKm: number,
  dateStart: string | null,
  dateEnd: string | null = null
) => ({
  slug,
  distanceKm,
  dateStart,
  dateEnd,
})

describe("sharesADay", () => {
  it("compares calendar days, multi-day ranges included", () => {
    const friday = { dateStart: at("2027-05-21"), dateEnd: null }
    const weekend = { dateStart: at("2027-05-22", "10:00"), dateEnd: at("2027-05-23", "23:00") }
    expect(sharesADay(friday, { dateStart: at("2027-05-21", "22:30"), dateEnd: null })).toBe(true)
    expect(sharesADay(friday, weekend)).toBe(false)
    expect(sharesADay({ dateStart: at("2027-05-23"), dateEnd: null }, weekend)).toBe(true)
  })

  it("never matches an undated event", () => {
    expect(
      sharesADay({ dateStart: null, dateEnd: null }, { dateStart: at("2027-05-21"), dateEnd: null })
    ).toBe(false)
  })
})

describe("pickNearbySuggestions", () => {
  const event = { dateStart: at("2027-05-22"), dateEnd: null }

  it("keeps same-day events within the radius, nearest first", () => {
    const result = pickNearbySuggestions(event, [
      place("same-close", 3, at("2027-05-22")),
      place("other-day", 4, at("2027-05-21")),
      place("same-far", 80, at("2027-05-22")),
      place("same-mid", 12, at("2027-05-21"), at("2027-05-23")),
    ])
    expect(result.sameDay).toBe(true)
    expect(result.items.map((item) => item.slug)).toEqual(["same-close", "same-mid"])
  })

  it("caps the list", () => {
    const many = Array.from({ length: 10 }, (_, i) => place(`p${i}`, i + 1, at("2027-05-22")))
    expect(pickNearbySuggestions(event, many, { limit: 4 }).items).toHaveLength(4)
  })

  it("falls back to the nearest events when none shares the day", () => {
    const result = pickNearbySuggestions(event, [
      place("a", 2, at("2027-05-21")),
      place("b", 9, at("2027-05-23")),
    ])
    expect(result.sameDay).toBe(false)
    expect(result.items.map((item) => item.slug)).toEqual(["a", "b"])
  })
})
