import { describe, it, expect, afterEach, vi } from "vitest"
import {
  DEFAULT_EDITION_SETTINGS,
  buildEdition,
  editionDateRange,
  editionKicker,
  editionYearRange,
  formatNight,
  getCountdownDays,
  getEditionMode,
  isDuringFestival,
  parseNightCodes,
  validateEditionSettings,
} from "./edition"

const edition2027 = buildEdition(DEFAULT_EDITION_SETTINGS)

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("buildEdition", () => {
  it("defaults to the 2027 edition, 21–23 May", () => {
    expect(edition2027.year).toBe(2027)
    expect(edition2027.ordinal).toBe(18)
    expect(edition2027.nights.map((night) => night.date)).toEqual([
      "2027-05-21",
      "2027-05-22",
      "2027-05-23",
    ])
  })

  it("derives night codes and roles from the dates, never from a fixed list", () => {
    expect(edition2027.nights.map((night) => night.code)).toEqual(["21", "22", "23"])
    expect(edition2027.nights.map((night) => night.role)).toEqual(["opening", "main", "closing"])
  })

  it("handles an edition across two months and a two-night edition", () => {
    const edition = buildEdition({ year: 2028, dateStart: "2028-05-31", dateEnd: "2028-06-01" })
    expect(edition.nights.map((night) => night.code)).toEqual(["31", "01"])
    expect(edition.nights.map((night) => night.role)).toEqual(["opening", "closing"])
  })

  it("switches to the bilan the day after the last night unless configured", () => {
    expect(edition2027.bilanFrom).toBe("2027-05-24")
    expect(buildEdition({ ...DEFAULT_EDITION_SETTINGS, bilanFrom: "2027-06-15" }).bilanFrom).toBe(
      "2027-06-15"
    )
  })
})

describe("edition mode and countdown", () => {
  it("is upcoming before the bilan switch and bilan after it (Paris time)", () => {
    expect(getEditionMode(edition2027, new Date("2027-05-23T21:59:00Z"))).toBe("upcoming")
    expect(getEditionMode(edition2027, new Date("2027-05-23T22:00:00Z"))).toBe("bilan")
  })

  it("honours the NEXT_PUBLIC_PEL_FORCE_MODE preview override", () => {
    vi.stubEnv("NEXT_PUBLIC_PEL_FORCE_MODE", "bilan")
    expect(getEditionMode(edition2027, new Date("2026-11-07T12:00:00Z"))).toBe("bilan")
  })

  it("counts whole days until the first night, then is live during the nights", () => {
    expect(getCountdownDays(edition2027, new Date("2027-05-19T22:00:00Z"))).toBe(1)
    expect(getCountdownDays(edition2027, new Date("2027-05-22T12:00:00Z"))).toBe(0)
    expect(isDuringFestival(edition2027, new Date("2027-05-20T21:00:00Z"))).toBe(false)
    expect(isDuringFestival(edition2027, new Date("2027-05-22T20:00:00Z"))).toBe(true)
    expect(isDuringFestival(edition2027, new Date("2027-05-23T22:30:00Z"))).toBe(false)
  })
})

describe("labels", () => {
  it("formats the date range in both locales, across months too", () => {
    expect(editionDateRange(edition2027, "fr")).toBe("21 — 23 mai 2027")
    expect(editionDateRange(edition2027, "en")).toBe("May 21–23, 2027")
    const crossMonth = buildEdition({ year: 2028, dateStart: "2028-05-31", dateEnd: "2028-06-01" })
    expect(editionDateRange(crossMonth, "fr")).toBe("31 mai — 1 juin 2028")
    expect(editionDateRange(crossMonth, "en")).toBe("May 31 – June 1, 2028")
  })

  it("builds the kicker for each mode", () => {
    expect(editionKicker(edition2027, "upcoming", "fr")).toBe("18ᵉ édition · 21 — 23 mai 2027")
    expect(editionKicker(edition2027, "bilan", "en")).toBe("2027 edition · Replay")
  })

  it("formats a night with its weekday", () => {
    const [friday] = edition2027.nights
    expect(formatNight(friday, "fr", "short")).toBe("Ven 21")
    expect(formatNight(friday, "fr", "long")).toBe("Ven 21 mai")
    expect(formatNight(friday, "en", "long")).toBe("Fri May 21")
    expect(formatNight(friday, "fr", "weekday")).toBe("Vendredi")
    expect(formatNight(friday, "en", "monthYear")).toBe("May 2027")
  })

  it("spans the calendar year of the edition", () => {
    const { gte, lt } = editionYearRange(edition2027)
    expect(gte).toEqual(new Date("2027-01-01T00:00:00"))
    expect(lt).toEqual(new Date("2028-01-01T00:00:00"))
  })
})

describe("validateEditionSettings", () => {
  it("accepts the default settings", () => {
    expect(validateEditionSettings(DEFAULT_EDITION_SETTINGS)).toEqual([])
  })

  it("rejects malformed dates, an end before the start and dates outside the year", () => {
    expect(
      validateEditionSettings({ year: 2027, dateStart: "21/05/2027", dateEnd: "2027-05-23" })
    ).not.toEqual([])
    expect(
      validateEditionSettings({ year: 2027, dateStart: "2027-05-23", dateEnd: "2027-05-21" })
    ).not.toEqual([])
    expect(
      validateEditionSettings({ year: 2027, dateStart: "2028-05-21", dateEnd: "2028-05-23" })
    ).not.toEqual([])
  })

  it("rejects more than five nights and a bilan switch before the last night", () => {
    expect(
      validateEditionSettings({ year: 2027, dateStart: "2027-05-01", dateEnd: "2027-05-10" })
    ).not.toEqual([])
    expect(
      validateEditionSettings({ ...DEFAULT_EDITION_SETTINGS, bilanFrom: "2027-05-22" })
    ).not.toEqual([])
  })
})

describe("parseNightCodes", () => {
  it("keeps the valid night codes of a comma-separated value, in night order", () => {
    expect(parseNightCodes("23,21", edition2027)).toEqual(["21", "23"])
    expect(parseNightCodes("22", edition2027)).toEqual(["22"])
  })

  it("drops unknown codes, duplicates and blanks", () => {
    expect(parseNightCodes("29,22,22,,x", edition2027)).toEqual(["22"])
    expect(parseNightCodes(undefined, edition2027)).toEqual([])
    expect(parseNightCodes(["21", "23"], edition2027)).toEqual(["21", "23"])
  })
})
