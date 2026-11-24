import { test, expect } from "@playwright/test"
import { hasDatabase, query } from "./helpers/db"

const SLUG = "e2e-page-libre"

test.describe("Pages created in the admin", () => {
  test.skip(!hasDatabase(), "needs DATABASE_URL to create the page")

  test.beforeAll(async () => {
    await query(
      `INSERT INTO pages (id, title_fr, title_en, slug, content_fr, content_en, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT (slug) DO UPDATE SET title_fr = EXCLUDED.title_fr, content_fr = EXCLUDED.content_fr`,
      [
        "e2e-page-libre",
        "Une page libre",
        "A free page",
        SLUG,
        "## Programme du soir\n\nUn texte écrit dans l'admin.",
        "## Evening programme\n\nText written in the admin.",
      ]
    )
  })

  test.afterAll(async () => {
    await query("DELETE FROM pages WHERE slug = $1", [SLUG])
  })

  test("render at their slug with the editorial page shell", async ({ page }) => {
    const response = await page.goto(`/fr/${SLUG}`)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole("heading", { level: 1, name: "Une page libre" })).toBeVisible()
    await expect(page.getByRole("heading", { level: 2, name: "Programme du soir" })).toBeVisible()
    await expect(page.getByText("Un texte écrit dans l'admin.")).toBeVisible()
  })

  test("deeper unknown paths still end in the 404 page", async ({ page }) => {
    const response = await page.goto(`/fr/${SLUG}/autre`)
    expect(response?.status()).toBe(404)
  })
})
