import { describe, it, expect } from "vitest"
import { themeSchema } from "./theme"

const valid = {
  nameFr: "Millénaire",
  nameEn: "",
  slug: "millennium",
  descriptionFr: "",
  descriptionEn: "",
  color: "#d97706",
  markerImage: "/themes/millennium-marker.svg",
  showOnHome: true,
  order: "0",
}

describe("themeSchema", () => {
  it("accepts a theme with a local marker path", () => {
    const result = themeSchema.safeParse(valid)
    expect(result.success).toBe(true)
    expect(result.data?.order).toBe(0)
  })

  it("accepts an uploaded https marker and no marker at all", () => {
    expect(themeSchema.safeParse({ ...valid, markerImage: "https://cdn.test/m.png" }).success).toBe(
      true
    )
    expect(themeSchema.safeParse({ ...valid, markerImage: "" }).success).toBe(true)
  })

  it("rejects a colour that is not #rrggbb", () => {
    const result = themeSchema.safeParse({ ...valid, color: "orange" })
    expect(result.error?.flatten().fieldErrors.color).toBeDefined()
  })

  it("rejects a slug with spaces or capitals", () => {
    const result = themeSchema.safeParse({ ...valid, slug: "Mille ans" })
    expect(result.error?.flatten().fieldErrors.slug).toBeDefined()
  })

  it("rejects a javascript: marker", () => {
    const result = themeSchema.safeParse({ ...valid, markerImage: "javascript:alert(1)" })
    expect(result.error?.flatten().fieldErrors.markerImage).toBeDefined()
  })
})
