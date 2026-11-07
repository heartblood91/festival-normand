import { describe, it, expect } from "vitest"
import {
  ALT_MAX_LENGTH,
  cleanAltProposal,
  imagesWithoutAlt,
  missingAltMessage,
  resolveImageUrl,
} from "./alt-text"

describe("imagesWithoutAlt", () => {
  it("lists images whose alt is missing or blank", () => {
    expect(
      imagesWithoutAlt(
        '<p>a</p><img src="/a.jpg"><img alt="  " src="/b.jpg" /><img src="/c.jpg" alt="Façade">'
      )
    ).toEqual(["/a.jpg", "/b.jpg"])
  })

  it("accepts single quotes and attribute order", () => {
    expect(imagesWithoutAlt("<img class='x' alt='Nef' src='/d.jpg'>")).toEqual([])
    expect(imagesWithoutAlt("")).toEqual([])
  })
})

describe("missingAltMessage", () => {
  it("is empty when every image is described", () => {
    expect(missingAltMessage('<img src="/a.jpg" alt="Nef">')).toBe("")
    expect(missingAltMessage('<img src="/a.jpg"><img src="/b.jpg">')).toBe(
      "2 image(s) sans texte alternatif dans le contenu"
    )
  })
})

describe("cleanAltProposal", () => {
  it("drops quotes, labels and extra spaces", () => {
    expect(cleanAltProposal('  "Façade de l’église   illuminée."  ')).toBe(
      "Façade de l’église illuminée."
    )
    expect(cleanAltProposal("Texte alternatif : Chœur de l'abbaye")).toBe("Chœur de l'abbaye")
  })

  it("cuts long proposals on a word boundary", () => {
    const long = `${"mot ".repeat(80)}fin`
    const cleaned = cleanAltProposal(long)
    expect(cleaned.length).toBeLessThanOrEqual(ALT_MAX_LENGTH)
    expect(cleaned.endsWith("mot")).toBe(true)
  })
})

describe("resolveImageUrl", () => {
  it("keeps absolute web URLs and resolves site paths", () => {
    expect(resolveImageUrl("https://cdn.example.org/a.jpg", "")).toBe(
      "https://cdn.example.org/a.jpg"
    )
    expect(resolveImageUrl("/uploads/a.jpg", "https://pel.example.org")).toBe(
      "https://pel.example.org/uploads/a.jpg"
    )
  })

  it("refuses other schemes and site paths without a site URL", () => {
    expect(resolveImageUrl("data:image/png;base64,AAAA", "https://x.org")).toBeNull()
    expect(resolveImageUrl("javascript:alert(1)", "https://x.org")).toBeNull()
    expect(resolveImageUrl("/uploads/a.jpg", "")).toBeNull()
  })
})
