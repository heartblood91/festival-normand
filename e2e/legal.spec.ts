import { test, expect } from "@playwright/test"

test.describe("Mentions legales page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(page).toHaveTitle(/Mentions légales/)
  })

  test("displays editor information", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(page.getByRole("heading", { name: /Editeur/ })).toBeVisible()
    await expect(page.getByText(/Département de l'Orne/).first()).toBeVisible()
  })

  test("displays hosting information", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(page.getByRole("heading", { name: /Hébergement/ })).toBeVisible()
    await expect(page.getByText(/OVH SAS/)).toBeVisible()
  })

  test("displays intellectual property section", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(
      page.getByRole("heading", { name: /propriété intellectuelle/i })
    ).toBeVisible()
  })

  test("displays RGPD / personal data section", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(page.getByRole("heading", { name: /Données personnelles/ })).toBeVisible()
    await expect(page.getByText(/RGPD/).first()).toBeVisible()
  })

  test("displays cookies section", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(page.getByRole("heading", { name: /cookies/i })).toBeVisible()
  })

  test("page is accessible via footer link", async ({ page }) => {
    await page.goto("/")

    const footerLink = page.locator("footer").getByRole("link", { name: "Mentions légales" })
    await footerLink.click()

    await expect(page).toHaveURL(/\/mentions-legales/)
  })
})
