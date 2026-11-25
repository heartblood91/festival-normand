import { describe, it, expect } from "vitest"
import {
  isPassPatrimoineSiteUrl,
  isPassPatrimoineUrl,
  normalizePassPatrimoineUrl,
  withPassUtm,
} from "./url"

const CANON = "https://www.pass-patrimoine.fr/fr/lieux-et-visites/chateau-de-canon"

describe("normalizePassPatrimoineUrl", () => {
  it("accepts a partner page on both hosts and returns the canonical URL", () => {
    expect(normalizePassPatrimoineUrl(CANON)).toBe(CANON)
    expect(
      normalizePassPatrimoineUrl("https://pass-patrimoine.fr/fr/lieux-et-visites/chateau-de-canon/")
    ).toBe(CANON)
  })

  it("drops a pasted query string and hash", () => {
    expect(normalizePassPatrimoineUrl(`${CANON}?utm_source=x#horaires`)).toBe(CANON)
  })

  it.each([
    ["http", "http://www.pass-patrimoine.fr/fr/lieux-et-visites/chateau-de-canon"],
    ["another host", "https://www.pass-patrimoine.fr.evil.com/fr/lieux-et-visites/canon"],
    ["a lookalike host", "https://pass-patrimoine.com/fr/lieux-et-visites/chateau-de-canon"],
    ["the home page", "https://www.pass-patrimoine.fr/"],
    ["another section", "https://www.pass-patrimoine.fr/fr/offrir/chateau-de-canon"],
    ["an English page", "https://www.pass-patrimoine.fr/en/lieux-et-visites/chateau-de-canon"],
    ["a nested path", "https://www.pass-patrimoine.fr/fr/lieux-et-visites/a/b"],
    ["credentials", "https://user:pw@www.pass-patrimoine.fr/fr/lieux-et-visites/canon"],
    ["a port", "https://www.pass-patrimoine.fr:8443/fr/lieux-et-visites/canon"],
    ["uppercase slug", "https://www.pass-patrimoine.fr/fr/lieux-et-visites/Chateau"],
    ["not a URL", "chateau de canon"],
  ])("refuses %s", (_, value) => {
    expect(normalizePassPatrimoineUrl(value)).toBeNull()
    expect(isPassPatrimoineUrl(value)).toBe(false)
  })

  it("treats empty values as no link", () => {
    expect(isPassPatrimoineUrl(null)).toBe(false)
    expect(isPassPatrimoineUrl("")).toBe(false)
  })
})

describe("isPassPatrimoineSiteUrl", () => {
  it("accepts any https page of the pass site, for the banner", () => {
    expect(isPassPatrimoineSiteUrl("https://www.pass-patrimoine.fr")).toBe(true)
    expect(isPassPatrimoineSiteUrl("https://www.pass-patrimoine.fr/fr/offrir")).toBe(true)
  })

  it("refuses other sites and plain http", () => {
    expect(isPassPatrimoineSiteUrl("https://example.com")).toBe(false)
    expect(isPassPatrimoineSiteUrl("http://www.pass-patrimoine.fr")).toBe(false)
    expect(isPassPatrimoineSiteUrl("javascript:alert(1)")).toBe(false)
  })
})

describe("withPassUtm", () => {
  it("adds the festival UTM parameters, replacing existing ones", () => {
    const url = new URL(withPassUtm(`${CANON}?utm_source=other&ref=1`))
    expect(url.searchParams.get("utm_source")).toBe("pierres-en-lumieres")
    expect(url.searchParams.get("utm_medium")).toBe("referral")
    expect(url.searchParams.get("utm_campaign")).toBe("festival")
    expect(url.searchParams.get("ref")).toBe("1")
  })
})
