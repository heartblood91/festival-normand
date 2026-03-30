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
    const result = eventSchema.safeParse({ ...validData, latitude: "49.1844", longitude: "-0.3706" })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.latitude).toBe(49.1844)
      expect(result.data.longitude).toBe(-0.3706)
    }
  })

  it("rejects string 'undefined' for latitude/longitude", () => {
    const result = eventSchema.safeParse({ ...validData, latitude: "undefined", longitude: "undefined" })
    expect(result.success).toBe(false)
  })

  it("rejects out-of-range latitude", () => {
    const result = eventSchema.safeParse({ ...validData, latitude: "100" })
    expect(result.success).toBe(false)
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
