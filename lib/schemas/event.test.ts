import { describe, it, expect } from "vitest"

import { eventSchema, slugify } from "./event"

describe("eventSchema", () => {
  const validData = {
    titleFr: "Festival de Lumières",
    slug: "festival-de-lumieres",
    descriptionFr: "Un magnifique événement nocturne du patrimoine normand.",
    location: "Château de Caen",
    city: "Caen",
    postalCode: "14000",
    department: "CALVADOS",
    category: "ILLUMINATIONS",
    dateStart: "2026-05-29",
    featured: false,
    accessible: false,
    published: true,
  }

  it("validates correct data", () => {
    const result = eventSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it("rejects title shorter than 3 characters", () => {
    const result = eventSchema.safeParse({ ...validData, titleFr: "ab" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid slug format", () => {
    const result = eventSchema.safeParse({ ...validData, slug: "Invalid Slug!" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid department", () => {
    const result = eventSchema.safeParse({ ...validData, department: "PARIS" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid category", () => {
    const result = eventSchema.safeParse({ ...validData, category: "CONCERTS" })
    expect(result.success).toBe(false)
  })

  it("accepts optional fields as empty strings", () => {
    const result = eventSchema.safeParse({
      ...validData,
      dateEnd: "",
      timeStart: "",
      timeEnd: "",
      pricingFr: "",
      email: "",
      website: "",
    })
    expect(result.success).toBe(true)
  })

  it("rejects invalid email format", () => {
    const result = eventSchema.safeParse({ ...validData, email: "not-an-email" })
    expect(result.success).toBe(false)
  })

  it("rejects invalid website URL", () => {
    const result = eventSchema.safeParse({ ...validData, website: "not-a-url" })
    expect(result.success).toBe(false)
  })

  it("accepts only a fondation-patrimoine.org link for the collect", () => {
    const url = "https://www.fondation-patrimoine.org/les-projets/abbaye/123"
    expect(eventSchema.safeParse({ ...validData, fundraisingUrl: url }).success).toBe(true)
    expect(eventSchema.safeParse({ ...validData, fundraisingUrl: "" }).success).toBe(true)
    const other = eventSchema.safeParse({
      ...validData,
      fundraisingUrl: "https://www.helloasso.com/x",
    })
    expect(other.success).toBe(false)
    expect(other.error?.flatten().fieldErrors.fundraisingUrl?.[0]).toMatch(
      /fondation-patrimoine\.org/
    )
  })

  it("accepts a collect image from the Fondation CDN only", () => {
    const base = {
      ...validData,
      fundraisingUrl: "https://www.fondation-patrimoine.org/les-projets/abbaye/123",
    }
    expect(
      eventSchema.safeParse({
        ...base,
        fundraisingImage: "https://strapi-upload.cdn.fondation-patrimoine.org/a.jpg",
      }).success
    ).toBe(true)
    expect(
      eventSchema.safeParse({ ...base, fundraisingImage: "https://example.com/a.jpg" }).success
    ).toBe(false)
  })

  it("accepts empty string latitude/longitude (coerced to 0)", () => {
    const result = eventSchema.safeParse({ ...validData, latitude: "", longitude: "" })
    expect(result.success).toBe(true)
    if (result.success) {
      // Number("") === 0, so empty string is coerced to 0
      expect(result.data.latitude).toBe(0)
      expect(result.data.longitude).toBe(0)
    }
  })

  it("accepts valid numeric string latitude/longitude", () => {
    const result = eventSchema.safeParse({
      ...validData,
      latitude: "49.1844",
      longitude: "-0.3706",
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.latitude).toBe(49.1844)
      expect(result.data.longitude).toBe(-0.3706)
    }
  })

  it("rejects string 'undefined' for latitude/longitude", () => {
    const result = eventSchema.safeParse({
      ...validData,
      latitude: "undefined",
      longitude: "undefined",
    })
    expect(result.success).toBe(false)
  })

  it("rejects out-of-range latitude", () => {
    const result = eventSchema.safeParse({ ...validData, latitude: "100" })
    expect(result.success).toBe(false)
  })

  it("rejects an end date before the start date, on the end date field", () => {
    const result = eventSchema.safeParse({
      ...validData,
      dateStart: "2027-05-22",
      dateEnd: "2027-05-21",
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.dateEnd).toEqual([
      "La date de fin doit être identique ou postérieure à la date de début",
    ])
  })

  it("accepts a same-day end, and a night ending after midnight", () => {
    const result = eventSchema.safeParse({
      ...validData,
      dateStart: "2027-05-21",
      dateEnd: "2027-05-21",
      timeStart: "21:00",
      timeEnd: "00:30",
    })
    expect(result.success).toBe(true)
  })

  it("requires a cover alt text to publish, not to keep a draft", () => {
    const withCover = { ...validData, coverImage: "https://cdn.example.org/a.jpg" }
    const published = eventSchema.safeParse(withCover)
    expect(published.error?.flatten().fieldErrors.coverImageAltFr).toEqual([
      "Décrivez l'image de couverture (texte alternatif) avant de publier",
    ])
    expect(eventSchema.safeParse({ ...withCover, published: false }).success).toBe(true)
    expect(
      eventSchema.safeParse({ ...withCover, coverImageAltFr: "Église illuminée de nuit" }).success
    ).toBe(true)
  })

  it("refuses to publish content images without alt, per language", () => {
    const result = eventSchema.safeParse({
      ...validData,
      descriptionFr: '<p>Une veillée.</p><img src="/a.jpg">',
      descriptionEn: '<p>An evening.</p><img src="/a.jpg" alt="Nave">',
    })
    expect(result.error?.flatten().fieldErrors).toEqual({
      descriptionFr: ["1 image(s) sans texte alternatif dans le contenu"],
    })
  })

  it("accepts omitted latitude/longitude (optional)", () => {
    const result = eventSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })
})

describe("slugify", () => {
  it("converts text to lowercase slug", () => {
    expect(slugify("Festival de Lumières")).toBe("festival-de-lumieres")
  })

  it("removes accents", () => {
    expect(slugify("Événement à Château")).toBe("evenement-a-chateau")
  })

  it("replaces spaces with hyphens", () => {
    expect(slugify("hello world test")).toBe("hello-world-test")
  })

  it("removes special characters", () => {
    expect(slugify("hello! @world #test")).toBe("hello-world-test")
  })

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--hello--")).toBe("hello")
  })
})
