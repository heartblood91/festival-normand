import { describe, it, expect } from "vitest"
import { normalizeLinkUrl, isYoutubeUrl } from "./editor-urls"

describe("normalizeLinkUrl", () => {
  it("keeps web, mail, phone and site links", () => {
    expect(normalizeLinkUrl(" https://example.org/a ")).toBe("https://example.org/a")
    expect(normalizeLinkUrl("mailto:contact@example.org")).toBe("mailto:contact@example.org")
    expect(normalizeLinkUrl("tel:+33231000000")).toBe("tel:+33231000000")
    expect(normalizeLinkUrl("/fr/evenements")).toBe("/fr/evenements")
  })

  it("adds https to a bare domain", () => {
    expect(normalizeLinkUrl("www.calvados-tourisme.com/x")).toBe(
      "https://www.calvados-tourisme.com/x"
    )
  })

  it("refuses scripts, blanks and malformed input", () => {
    expect(normalizeLinkUrl("javascript:alert(1)")).toBeNull()
    expect(normalizeLinkUrl("  ")).toBeNull()
    expect(normalizeLinkUrl("pas une adresse")).toBeNull()
  })
})

describe("isYoutubeUrl", () => {
  it("accepts YouTube watch, short and embed links only", () => {
    expect(isYoutubeUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe(true)
    expect(isYoutubeUrl("https://youtu.be/dQw4w9WgXcQ")).toBe(true)
    expect(isYoutubeUrl("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ")).toBe(true)
    expect(isYoutubeUrl("https://vimeo.com/123")).toBe(false)
    expect(isYoutubeUrl("youtube")).toBe(false)
  })
})
