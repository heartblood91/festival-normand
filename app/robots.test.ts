import { describe, it, expect } from "vitest"
import robots from "./robots"

describe("robots", () => {
  it("allows all crawlers on public pages", () => {
    const result = robots()

    expect(result.rules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userAgent: "*",
          allow: "/",
        }),
      ])
    )
  })

  it("disallows admin and API routes", () => {
    const result = robots()

    const mainRule = Array.isArray(result.rules)
      ? result.rules.find((r) => r.userAgent === "*")
      : result.rules

    expect(mainRule?.disallow).toContain("/admin/")
    expect(mainRule?.disallow).toContain("/api/")
  })

  it("includes sitemap URL", () => {
    const result = robots()

    expect(result.sitemap).toBe("https://pierresenlumieres.fr/sitemap.xml")
  })
})
