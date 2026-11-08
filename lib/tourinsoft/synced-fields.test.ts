import { describe, it, expect } from "vitest"
import { TOURINSOFT_SYNCED_FIELDS, syncedFieldsSummary } from "./synced-fields"

describe("TOURINSOFT_SYNCED_FIELDS", () => {
  it("lists the editor-visible fields the sync overwrites", () => {
    expect(TOURINSOFT_SYNCED_FIELDS).toMatchObject({
      titleFr: "Titre (FR)",
      descriptionFr: "Description (FR)",
      pricingFr: "Tarifs (FR)",
      photos: "Photos et image de couverture",
    })
  })

  it("leaves editor-owned fields out", () => {
    for (const field of ["slug", "published", "featured", "accessible", "coverImageAltFr"]) {
      expect(TOURINSOFT_SYNCED_FIELDS).not.toHaveProperty(field)
    }
  })
})

describe("syncedFieldsSummary", () => {
  it("joins the labels in a readable French sentence", () => {
    const summary = syncedFieldsSummary()
    expect(summary.startsWith("Titre (FR), Description (FR)")).toBe(true)
    expect(summary).toMatch(/ et Photos et image de couverture$/)
  })
})
