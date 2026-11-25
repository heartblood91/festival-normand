import { describe, expect, it } from "vitest"
import { localizeSkinTexts } from "@/lib/skins/texts"

const empty = {
  ribbonTitleFr: null,
  ribbonTitleEn: null,
  ribbonDatesFr: null,
  ribbonDatesEn: null,
  ribbonCtaFr: null,
  ribbonCtaEn: null,
}

describe("localizeSkinTexts", () => {
  it("returns null for empty fields so the skin keeps its defaults", () => {
    expect(localizeSkinTexts({ ...empty, ribbonTitleFr: "  " }, "fr")).toEqual({
      title: null,
      dates: null,
      cta: null,
    })
  })

  it("uses English when given, otherwise the French text", () => {
    const texts = {
      ...empty,
      ribbonTitleFr: "Millénaire",
      ribbonTitleEn: "Millennium",
      ribbonDatesFr: "1027 – 2027",
      ribbonCtaEn: "",
    }
    expect(localizeSkinTexts(texts, "en")).toEqual({
      title: "Millennium",
      dates: "1027 – 2027",
      cta: null,
    })
    expect(localizeSkinTexts(texts, "fr").title).toBe("Millénaire")
  })

  it("never shows English text on the French site", () => {
    expect(localizeSkinTexts({ ...empty, ribbonCtaEn: "Events" }, "fr").cta).toBeNull()
  })
})
