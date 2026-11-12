import { describe, it, expect } from "vitest"
import { extractSocialLinks, normalizeSocialUrl, socialPlatform } from "./social-links"

describe("social links", () => {
  it("recognises the platforms, whatever the subdomain", () => {
    expect(socialPlatform("https://www.facebook.com/abbaye.hambye")).toBe("facebook")
    expect(socialPlatform("https://m.facebook.com/abbaye.hambye")).toBe("facebook")
    expect(socialPlatform("https://twitter.com/rouen")).toBe("x")
    expect(socialPlatform("https://example.com/facebook")).toBeNull()
    expect(socialPlatform("javascript:alert(1)")).toBeNull()
  })

  it("normalises a profile and refuses share buttons", () => {
    expect(normalizeSocialUrl("http://www.instagram.com/chateau_canon/?utm_source=site")).toBe(
      "https://instagram.com/chateau_canon"
    )
    expect(normalizeSocialUrl("https://www.facebook.com/profile.php?id=1234&ref=x")).toBe(
      "https://facebook.com/profile.php?id=1234"
    )
    expect(
      normalizeSocialUrl("https://www.facebook.com/sharer/sharer.php?u=https://a.fr")
    ).toBeNull()
    expect(normalizeSocialUrl("https://twitter.com/intent/tweet?text=hello")).toBeNull()
    expect(normalizeSocialUrl("https://www.facebook.com/")).toBeNull()
  })

  it("refuses single videos and posts, which are not the site's page", () => {
    expect(normalizeSocialUrl("https://youtu.be/mP3-k-m3rcY")).toBeNull()
    expect(normalizeSocialUrl("https://www.youtube.com/shorts/abc")).toBeNull()
    expect(normalizeSocialUrl("https://www.instagram.com/p/C1x2y3/")).toBeNull()
    expect(normalizeSocialUrl("https://x.com/rouen/status/123")).toBeNull()
    expect(normalizeSocialUrl("https://www.instagram.com/pierres_en_lumieres")).toBe(
      "https://instagram.com/pierres_en_lumieres"
    )
    expect(normalizeSocialUrl("https://www.youtube.com/@chateau")).toBe(
      "https://youtube.com/@chateau"
    )
  })

  it("keeps the first profile of each platform found on a page", () => {
    const html = `
      <a href="https://www.facebook.com/sharer/sharer.php?u=x">Partager</a>
      <a class="fb" href="https://www.facebook.com/AbbayeHambye/">Facebook</a>
      <a href='https://www.instagram.com/abbaye_hambye'>Insta</a>
      <a href="https://www.facebook.com/AutrePage">Autre</a>
      <a href="/contact">Contact</a>
      <a href="https://www.youtube.com/@abbaye-hambye">YouTube</a>`
    expect(extractSocialLinks(html, "https://abbaye-hambye.fr/")).toEqual([
      "https://facebook.com/AbbayeHambye",
      "https://instagram.com/abbaye_hambye",
      "https://youtube.com/@abbaye-hambye",
    ])
  })
})
