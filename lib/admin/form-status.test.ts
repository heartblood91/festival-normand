import { describe, it, expect } from "vitest"
import { localeTabStatus, toLocalDateInput } from "./form-status"

const fields = { fr: ["titleFr", "descriptionFr"], en: ["titleEn", "descriptionEn"] }

describe("localeTabStatus", () => {
  it("flags a locale with server errors on one of its fields", () => {
    expect(
      localeTabStatus({
        fields,
        errors: { descriptionFr: ["Trop court"] },
        values: { titleFr: "Titre", descriptionFr: "x", titleEn: "Title", descriptionEn: "Text" },
      })
    ).toEqual({ fr: "error", en: null })
  })

  it("marks a locale incomplete when a field the other locale has is empty", () => {
    expect(
      localeTabStatus({
        fields,
        errors: {},
        values: {
          titleFr: "Titre",
          descriptionFr: "<p>Texte</p>",
          titleEn: "",
          descriptionEn: "<p></p>",
        },
      })
    ).toEqual({ fr: null, en: "incomplete" })
  })

  it("does not ask for a translation of an empty source", () => {
    expect(
      localeTabStatus({
        fields,
        errors: {},
        values: { titleFr: "Titre", descriptionFr: "", titleEn: "Title", descriptionEn: "" },
      })
    ).toEqual({ fr: null, en: null })
  })
})

describe("toLocalDateInput", () => {
  it("uses the Paris calendar day, not the UTC one", () => {
    // 00:30 in Paris on 21 May is still 20 May in UTC.
    expect(toLocalDateInput(new Date("2027-05-20T22:30:00Z"))).toBe("2027-05-21")
    expect(toLocalDateInput(new Date("2027-01-05T22:59:00Z"))).toBe("2027-01-05")
    expect(toLocalDateInput(new Date("2027-01-05T23:00:00Z"))).toBe("2027-01-06")
  })
})
