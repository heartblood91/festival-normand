import { describe, it, expect } from "vitest"
import { NAV_ITEMS, CTA_HREF, SOCIAL_LINKS } from "@/lib/navigation"

describe("navigation config", () => {
  it("has all required nav items with keys", () => {
    const keys = NAV_ITEMS.map((item) => item.key)
    expect(keys).toContain("home")
    expect(keys).toContain("events")
    expect(keys).toContain("news")
    expect(keys).toContain("festival")
    expect(keys).toContain("contact")
  })

  it("has valid hrefs for all nav items", () => {
    NAV_ITEMS.forEach((item) => {
      expect(item.href).toMatch(/^\//)
    })
  })

  it("has CTA href configured", () => {
    expect(CTA_HREF).toBe("/inscription")
  })

  it("has social links configured", () => {
    expect(SOCIAL_LINKS.facebook).toMatch(/facebook\.com/)
    expect(SOCIAL_LINKS.instagram).toMatch(/instagram\.com/)
  })
})
