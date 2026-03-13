import { describe, it, expect } from "vitest"

// Test the helper functions directly by extracting the logic
// Since the migration script is a standalone script, we test the pure functions

const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100)
}

const mapDepartment = (dept: string | undefined): string | undefined => {
  if (!dept) return undefined
  const normalized = dept.toUpperCase().replace(/-/g, "_").replace(/\s/g, "_")
  const validDepts = ["CALVADOS", "EURE", "MANCHE", "ORNE", "SEINE_MARITIME"]
  return validDepts.includes(normalized) ? normalized : undefined
}

const mapCategory = (cat: string | undefined): string | undefined => {
  if (!cat) return undefined
  const normalized = cat.toUpperCase().replace(/-/g, "_").replace(/\s/g, "_")
  const validCats = ["ILLUMINATIONS", "EXPOSITIONS", "ANIMATIONS", "VISITES"]
  return validCats.includes(normalized) ? normalized : undefined
}

const getImageUrl = (
  baseUrl: string,
  fileId: string | undefined
): string | undefined => {
  if (!fileId) return undefined
  return `${baseUrl}/assets/${fileId}`
}

describe("migrate-directus helpers", () => {
  describe("slugify", () => {
    it("converts title to slug", () => {
      expect(slugify("Illumination de l'Abbaye")).toBe(
        "illumination-de-labbaye"
      )
    })

    it("handles accented characters", () => {
      expect(slugify("Événement à Fécamp")).toBe("evenement-a-fecamp")
    })

    it("collapses multiple dashes", () => {
      expect(slugify("Test --- multiple   spaces")).toBe(
        "test-multiple-spaces"
      )
    })

    it("truncates to 100 characters", () => {
      const longTitle = "A".repeat(150)
      expect(slugify(longTitle).length).toBeLessThanOrEqual(100)
    })

    it("handles empty string", () => {
      expect(slugify("")).toBe("")
    })
  })

  describe("mapDepartment", () => {
    it("maps valid department names", () => {
      expect(mapDepartment("CALVADOS")).toBe("CALVADOS")
      expect(mapDepartment("EURE")).toBe("EURE")
      expect(mapDepartment("MANCHE")).toBe("MANCHE")
      expect(mapDepartment("ORNE")).toBe("ORNE")
      expect(mapDepartment("SEINE_MARITIME")).toBe("SEINE_MARITIME")
    })

    it("normalizes department names with dashes", () => {
      expect(mapDepartment("SEINE-MARITIME")).toBe("SEINE_MARITIME")
    })

    it("handles case insensitivity", () => {
      expect(mapDepartment("calvados")).toBe("CALVADOS")
    })

    it("returns undefined for invalid department", () => {
      expect(mapDepartment("INVALID")).toBeUndefined()
    })

    it("returns undefined for undefined input", () => {
      expect(mapDepartment(undefined)).toBeUndefined()
    })
  })

  describe("mapCategory", () => {
    it("maps valid category names", () => {
      expect(mapCategory("ILLUMINATIONS")).toBe("ILLUMINATIONS")
      expect(mapCategory("EXPOSITIONS")).toBe("EXPOSITIONS")
      expect(mapCategory("ANIMATIONS")).toBe("ANIMATIONS")
      expect(mapCategory("VISITES")).toBe("VISITES")
    })

    it("handles case insensitivity", () => {
      expect(mapCategory("illuminations")).toBe("ILLUMINATIONS")
    })

    it("returns undefined for invalid category", () => {
      expect(mapCategory("CONCERTS")).toBeUndefined()
    })

    it("returns undefined for undefined input", () => {
      expect(mapCategory(undefined)).toBeUndefined()
    })
  })

  describe("getImageUrl", () => {
    it("constructs image URL from file ID", () => {
      expect(getImageUrl("https://example.com/backend", "abc123")).toBe(
        "https://example.com/backend/assets/abc123"
      )
    })

    it("returns undefined for undefined file ID", () => {
      expect(getImageUrl("https://example.com/backend", undefined)).toBeUndefined()
    })

    it("returns undefined for empty file ID", () => {
      expect(getImageUrl("https://example.com/backend", "")).toBeUndefined()
    })
  })
})
