import { describe, it, expect } from "vitest"
import { htmlToMarkdown, stripLeadingTitle } from "./markdown"

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

describe("htmlToMarkdown with formatted paragraphs", () => {
  it("keeps paragraphs that hold bold, italic or links apart", () => {
    expect(
      htmlToMarkdown(
        "<p>Premier <strong>gras</strong> fin.</p><p>Second <em>ital</em>.</p><p>Troisième simple.</p>"
      )
    ).toBe("Premier **gras** fin.\n\nSecond *ital*.\n\nTroisième simple.")
  })

  it("starts a list on its own line, even with editor paragraphs inside items", () => {
    expect(
      htmlToMarkdown(
        '<p>Voir <a href="https://x.fr">le site</a></p><ul><li><p>un</p></li><li><p>deux</p></li></ul><p>Fin</p>'
      )
    ).toBe("Voir [le site](https://x.fr)\n\n- un\n- deux\n\nFin")
  })
})
