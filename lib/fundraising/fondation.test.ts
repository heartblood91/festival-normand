import { describe, it, expect } from "vitest"
import {
  fondationProjectUrl,
  isFundraisingImageUrl,
  isFundraisingUrl,
  toFondationProject,
} from "@/lib/fundraising/fondation"

const hit = {
  code: "91234",
  slug: "eglise-saint-pierre-de-falaise",
  title: "Église Saint-Pierre de Falaise",
  shortTitle: "Église Saint-Pierre",
  city: "FALAISE",
  postalCode: "14700",
  departmentCode: "14",
  regionCode: "28",
  fundingStatus: "IN_PROGRESS",
  _geoloc: { lat: 48.895, lng: -0.196 },
  collect: { collectedPercent: 42, endDate: "2027-11-20" },
  image: { thumbnailUrl: "https://strapi-upload.cdn.fondation-patrimoine.org/thumb.jpg" },
}

describe("toFondationProject", () => {
  it("keeps what the matching and the event page need from a search hit", () => {
    expect(toFondationProject(hit)).toEqual({
      code: "91234",
      title: "Église Saint-Pierre de Falaise",
      city: "FALAISE",
      postalCode: "14700",
      departmentCode: "14",
      latitude: 48.895,
      longitude: -0.196,
      imageUrl: "https://strapi-upload.cdn.fondation-patrimoine.org/thumb.jpg",
      collectedPercent: 42,
      endDate: "2027-11-20",
      url: "https://www.fondation-patrimoine.org/les-projets/eglise-saint-pierre-de-falaise/91234",
    })
  })

  it("tolerates a hit without GPS, image or collect", () => {
    const { _geoloc, image, collect, ...bare } = hit
    void _geoloc
    void image
    void collect
    expect(toFondationProject(bare)).toMatchObject({
      latitude: null,
      longitude: null,
      imageUrl: null,
      collectedPercent: null,
      endDate: null,
    })
  })

  it("keeps a hit whose GPS is an empty object or whose place fields are null", () => {
    expect(toFondationProject({ ...hit, _geoloc: {}, postalCode: null })).toMatchObject({
      code: "91234",
      postalCode: "",
      latitude: null,
      longitude: null,
    })
  })

  it("rejects a hit without code, slug or title", () => {
    expect(toFondationProject({ ...hit, code: "" })).toBeNull()
    expect(toFondationProject({ ...hit, slug: "../admin" })).toBeNull()
    expect(toFondationProject(null)).toBeNull()
  })
})

describe("fundraising URLs", () => {
  it("builds the public project page URL", () => {
    expect(fondationProjectUrl("abbaye", "123")).toBe(
      "https://www.fondation-patrimoine.org/les-projets/abbaye/123"
    )
  })

  it("accepts only https links to fondation-patrimoine.org", () => {
    expect(isFundraisingUrl("https://www.fondation-patrimoine.org/les-projets/abbaye/123")).toBe(
      true
    )
    expect(isFundraisingUrl("https://fondation-patrimoine.org/les-projets/abbaye/123")).toBe(true)
    expect(isFundraisingUrl("http://www.fondation-patrimoine.org/les-projets/abbaye/123")).toBe(
      false
    )
    expect(isFundraisingUrl("https://fondation-patrimoine.org.evil.com/x")).toBe(false)
    expect(isFundraisingUrl("javascript:alert(1)")).toBe(false)
    expect(isFundraisingUrl("not a url")).toBe(false)
  })

  it("accepts collect images from the Fondation CDN or our own storage", () => {
    expect(
      isFundraisingImageUrl("https://strapi-upload.cdn.fondation-patrimoine.org/thumb.jpg")
    ).toBe(true)
    expect(isFundraisingImageUrl("https://abc.public.blob.vercel-storage.com/a.jpg")).toBe(true)
    expect(isFundraisingImageUrl("https://example.com/a.jpg")).toBe(false)
  })
})
