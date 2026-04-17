import { test, expect } from "@playwright/test"

test.describe("Inscription page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page).toHaveTitle(/Comment vous inscrire|Inscr/)
  })

  test("displays inscription heading", async ({ page }) => {
    await page.goto("/inscription")

    await expect(
      page.getByRole("heading", { name: /Comment vous inscrire/, level: 1 })
    ).toBeVisible()
  })

  test("displays inscription details", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page.getByText(/Vous êtes un particulier/)).toBeVisible()
  })

  test("displays registration opening date", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page.getByText(/17 novembre 2025/)).toBeVisible()
  })

  test("renders tools section", async ({ page }) => {
    await page.goto("/inscription")

    await expect(
      page.getByRole("heading", { name: /Différents outils pour organiser votre manifestation/ })
    ).toBeVisible()
  })

  test("renders inscription section heading", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page.getByRole("heading", { name: /Inscrivez-vous/ })).toBeVisible()
  })

  test("page is accessible via header CTA button", async ({ page }) => {
    await page.goto("/")

    const ctaLink = page.locator("header").getByRole("link", { name: /Inscrivez votre événement/ })
    await ctaLink.click()

    await expect(page).toHaveURL(/\/inscription/)
  })
})
