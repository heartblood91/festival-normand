import { describe, it, expect } from "vitest"
import {
  DEFAULT_PASS_SETTINGS,
  isPassBannerVisible,
  parsePassSettings,
  passBannerStorageKey,
  passBannerVersion,
  passPatrimoineSettingsSchema,
  type PassPatrimoineSettings,
} from "./pass-patrimoine"

const settings = (patch: Partial<PassPatrimoineSettings> = {}): PassPatrimoineSettings => ({
  ...DEFAULT_PASS_SETTINGS,
  passEnabled: true,
  bannerEnabled: true,
  ...patch,
})

const issues = (data: unknown) => {
  const parsed = passPatrimoineSettingsSchema.safeParse(data)
  return parsed.success ? {} : parsed.error.flatten().fieldErrors
}

describe("passPatrimoineSettingsSchema", () => {
  it("accepts the defaults and turns empty dates into null", () => {
    const parsed = passPatrimoineSettingsSchema.parse({
      ...DEFAULT_PASS_SETTINGS,
      bannerStart: "",
      bannerEnd: "2027-01-31",
    })
    expect(parsed.bannerStart).toBeNull()
    expect(parsed.bannerEnd).toBe("2027-01-31")
  })

  it("refuses a banner link outside pass-patrimoine.fr", () => {
    expect(issues(settings({ bannerUrl: "https://example.com" })).bannerUrl?.[0]).toMatch(
      /pass-patrimoine\.fr/
    )
  })

  it("refuses an end date before the start date", () => {
    expect(
      issues(settings({ bannerStart: "2027-02-01", bannerEnd: "2027-01-01" })).bannerEnd
    ).toBeDefined()
  })

  it("requires both texts and a page only when the banner is on", () => {
    const empty = { bannerTextFr: "", bannerTextEn: "", bannerPages: [] }
    expect(issues(settings({ ...empty, bannerEnabled: false }))).toEqual({})
    const errors = issues(settings(empty))
    expect(Object.keys(errors).sort()).toEqual(["bannerPages", "bannerTextEn", "bannerTextFr"])
  })

  it("rejects unknown pages and overlong texts", () => {
    expect(issues({ ...settings(), bannerPages: ["news"] }).bannerPages).toBeDefined()
    expect(issues(settings({ bannerTextFr: "a".repeat(281) })).bannerTextFr).toBeDefined()
  })
})

describe("parsePassSettings", () => {
  it("is everything off without a row or with garbage", () => {
    expect(parsePassSettings(null)).toEqual(DEFAULT_PASS_SETTINGS)
    expect(parsePassSettings([1])).toEqual(DEFAULT_PASS_SETTINGS)
    expect(parsePassSettings({ bannerUrl: "https://evil.test" })).toEqual(DEFAULT_PASS_SETTINGS)
    expect(DEFAULT_PASS_SETTINGS.passEnabled).toBe(false)
    expect(DEFAULT_PASS_SETTINGS.bannerEnabled).toBe(false)
  })

  it("merges a partial row, like the migration's, over the defaults", () => {
    const parsed = parsePassSettings({ passEnabled: true, bannerEnabled: false })
    expect(parsed.passEnabled).toBe(true)
    expect(parsed.bannerTextFr).toBe(DEFAULT_PASS_SETTINGS.bannerTextFr)
  })
})

describe("isPassBannerVisible", () => {
  it("needs the banner switched on and the page selected", () => {
    expect(isPassBannerVisible(settings(), "home", "2026-11-25")).toBe(true)
    expect(isPassBannerVisible(settings({ bannerEnabled: false }), "home", "2026-11-25")).toBe(
      false
    )
    expect(isPassBannerVisible(settings({ bannerPages: ["event"] }), "home", "2026-11-25")).toBe(
      false
    )
  })

  it("respects the date window, both days included", () => {
    const window = settings({ bannerStart: "2026-12-01", bannerEnd: "2026-12-31" })
    expect(isPassBannerVisible(window, "event", "2026-11-30")).toBe(false)
    expect(isPassBannerVisible(window, "event", "2026-12-01")).toBe(true)
    expect(isPassBannerVisible(window, "event", "2026-12-31")).toBe(true)
    expect(isPassBannerVisible(window, "event", "2027-01-01")).toBe(false)
  })
})

describe("passBannerVersion", () => {
  it("changes with the content but not with the switches", () => {
    const base = passBannerVersion(settings())
    expect(passBannerVersion(settings({ bannerPages: ["home"] }))).toBe(base)
    expect(passBannerVersion(settings({ bannerTextFr: "Autre" }))).not.toBe(base)
    expect(passBannerStorageKey(base)).toBe(`pel-pass-banner-dismissed:${base}`)
  })
})
