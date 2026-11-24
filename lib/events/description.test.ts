import { describe, it, expect } from "vitest"
import { descriptionToEditorHtml, descriptionToPlainText, isHtmlDescription } from "./description"

describe("event description", () => {
  it("tells editor HTML from imported plain text", () => {
    expect(isHtmlDescription("<p>Visite <strong>nocturne</strong></p>")).toBe(true)
    expect(isHtmlDescription("Visite nocturne\nEntrée < 10 €")).toBe(false)
  })

  it("turns plain-text lines into escaped editor paragraphs", () => {
    expect(descriptionToEditorHtml("Visite & concert\n\nEntrée < 10 €")).toBe(
      "<p>Visite &amp; concert</p><p>Entrée &lt; 10 €</p>"
    )
    expect(descriptionToEditorHtml("<p>Déjà en HTML</p>")).toBe("<p>Déjà en HTML</p>")
  })

  it("flattens either format for meta descriptions", () => {
    expect(
      descriptionToPlainText("<p>Visite &amp; <strong>concert</strong></p><p>Gratuit</p>")
    ).toBe("Visite & concert Gratuit")
    expect(descriptionToPlainText("Visite\nnocturne")).toBe("Visite nocturne")
  })
})
