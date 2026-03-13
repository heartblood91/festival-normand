import { describe, it, expect } from "vitest"
import {
  NAV_ITEMS,
  CTA_LINK,
  SOCIAL_LINKS,
  FESTIVAL_NAME,
  FESTIVAL_DATES,
} from "@/lib/navigation"

describe("navigation config", () => {
  it("has all required nav items", () => {
    const labels = NAV_ITEMS.map((item) => item.label)
    expect(labels).toContain("Accueil")
    expect(labels).toContain("Événements")
    expect(labels).toContain("Actualités")
    expect(labels).toContain("Le Festival")
    expect(labels).toContain("Contact")
  })

  it("has valid hrefs for all nav items", () => {
    NAV_ITEMS.forEach((item) => {
      expect(item.href).toMatch(/^\//)
    })
  })

  it("has CTA link configured", () => {
    expect(CTA_LINK.label).toBe("Inscrivez votre événement")
    expect(CTA_LINK.href).toBe("/inscription")
  })

  it("has social links configured", () => {
    expect(SOCIAL_LINKS.facebook).toMatch(/facebook\.com/)
    expect(SOCIAL_LINKS.instagram).toMatch(/instagram\.com/)
  })

  it("exports festival name and dates", () => {
    expect(FESTIVAL_NAME).toBe("Pierres en Lumières")
    expect(FESTIVAL_DATES).toContain("2026")
  })
})
