import { describe, it, expect } from "vitest"
import { stripLeadingTitle } from "./markdown"

describe("stripLeadingTitle", () => {
  it("drops a leading h1 that repeats the page title", () => {
    expect(stripLeadingTitle("# Mentions légales\n\n## Éditeur", "Mentions légales")).toBe(
      "## Éditeur"
    )
  })

  it("ignores case, extra spaces and leading blank lines", () => {
    expect(stripLeadingTitle("\n#  le festival \nTexte", "Le Festival")).toBe("Texte")
  })

  it("keeps a leading h1 that differs from the title", () => {
    const content = "# Autre titre\n\nTexte"
    expect(stripLeadingTitle(content, "Le Festival")).toBe(content)
  })

  it("keeps content without a leading h1", () => {
    expect(stripLeadingTitle("Texte\n# Le Festival", "Le Festival")).toBe("Texte\n# Le Festival")
  })
})
