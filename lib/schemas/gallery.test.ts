import { describe, it, expect } from "vitest"
import { galleryAddSchema, galleryPhotoSchema } from "./gallery"

describe("galleryAddSchema", () => {
  it("accepts local and blob uploads", () => {
    const result = galleryAddSchema.safeParse({
      year: "2026",
      urls: ["/uploads/gallery-123.webp", "https://abc.public.blob.vercel-storage.com/x.webp"],
    })
    expect(result.success).toBe(true)
    expect(result.data?.year).toBe(2026)
  })

  it("rejects other addresses and empty batches", () => {
    expect(galleryAddSchema.safeParse({ year: 2026, urls: [] }).success).toBe(false)
    expect(galleryAddSchema.safeParse({ year: 2026, urls: ["javascript:alert(1)"] }).success).toBe(
      false
    )
    expect(galleryAddSchema.safeParse({ year: 2026, urls: ["/uploads/../x"] }).success).toBe(false)
    expect(
      galleryAddSchema.safeParse({ year: 2026, urls: ["http://example.com/a.jpg"] }).success
    ).toBe(false)
    expect(
      galleryAddSchema.safeParse({ year: 2026, urls: ["https://example.com/a.jpg"] }).success
    ).toBe(false)
  })

  it("rejects an implausible year", () => {
    expect(galleryAddSchema.safeParse({ year: 26, urls: ["/uploads/a.webp"] }).success).toBe(false)
  })
})

describe("galleryPhotoSchema", () => {
  const valid = { altFr: "Façade illuminée de l'abbaye", altEn: "", credit: "", year: 2026 }

  it("trims the texts", () => {
    const result = galleryPhotoSchema.parse({ ...valid, altFr: "  Façade illuminée  " })
    expect(result.altFr).toBe("Façade illuminée")
  })

  it("requires a meaningful French text alternative", () => {
    const result = galleryPhotoSchema.safeParse({ ...valid, altFr: "   " })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.altFr?.[0]).toMatch(/au moins 5/)
  })

  it("caps the credit length", () => {
    expect(galleryPhotoSchema.safeParse({ ...valid, credit: "x".repeat(121) }).success).toBe(false)
  })
})
