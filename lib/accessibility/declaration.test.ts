import { describe, expect, it } from "vitest"
import { accessibilityDeclaration, DECLARATION_DATE } from "@/lib/accessibility/declaration"

const headings = (content: string, level: number) =>
  content.split("\n").filter((line) => line.startsWith(`${"#".repeat(level)} `))

describe("accessibilityDeclaration", () => {
  it("has the six RGAA template sections, in the same order in each language", () => {
    const fr = accessibilityDeclaration("fr")
    const en = accessibilityDeclaration("en")
    expect(headings(fr.content, 2)).toEqual([
      "## État de conformité",
      "## Résultats des tests",
      "## Contenus non accessibles",
      "## Établissement de cette déclaration",
      "## Retour d'information et contact",
      "## Voies de recours",
    ])
    expect(headings(en.content, 2)).toHaveLength(6)
    expect(headings(en.content, 3)).toHaveLength(headings(fr.content, 3).length)
  })

  it("starts below the page title, so the page keeps a single h1", () => {
    for (const locale of ["fr", "en"] as const) {
      expect(headings(accessibilityDeclaration(locale).content, 1)).toEqual([])
    }
  })

  it("dates the statement and links the contact form of its own language", () => {
    expect(DECLARATION_DATE).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(accessibilityDeclaration("fr").content).toContain("le 11 novembre 2026")
    expect(accessibilityDeclaration("fr").content).toContain("](/fr/contact)")
    expect(accessibilityDeclaration("en").content).toContain("on 11 November 2026")
    expect(accessibilityDeclaration("en").content).toContain("](/en/contact)")
  })

  it("does not claim a compliance level that no audit has measured", () => {
    expect(accessibilityDeclaration("fr").content).toContain("**non conforme**")
    expect(accessibilityDeclaration("en").content).toContain("**non-compliant**")
    expect(accessibilityDeclaration("fr").content).not.toMatch(
      /partiellement conforme|totalement conforme/
    )
  })
})
