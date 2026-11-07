import { test, expect } from "@playwright/test"

test.describe("Inscription page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page).toHaveTitle(/Comment vous inscrire|Inscr/)
  })

  // Page copy is edited in the admin, so assert structure rather than wording.
  test("displays a single inscription heading", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    await expect(page.getByRole("heading", { level: 1, name: /inscri/i })).toBeVisible()
  })

  test("explains how to register", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page.getByRole("heading", { level: 2, name: /inscri/i }).first()).toBeVisible()
  })

  test("links to the department registration forms", async ({ page }) => {
    await page.goto("/inscription")

    const formLinks = page
      .locator("article a[href^='http']")
      .filter({ hasText: /Calvados|Eure|Manche|Orne|Seine-Maritime/ })
    expect(await formLinks.count()).toBeGreaterThanOrEqual(1)
  })

  test("page is accessible via header CTA button", async ({ page }) => {
    await page.goto("/")

    const ctaLink = page.locator("header").getByRole("link", { name: /Inscrire un événement/ })
    await ctaLink.click()

    await expect(page).toHaveURL(/\/inscription/)
  })
})
