import { test, expect } from "@playwright/test"

test.describe("Mentions legales page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(page).toHaveTitle(/Mentions légales/)
  })

  test("displays editor information", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(page.getByRole("heading", { name: /Éditeur du site/ })).toBeVisible()
    await expect(page.locator("article").getByText("Région Normandie", { exact: true }).first()).toBeVisible()
  })

  test("displays hosting information", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(page.getByRole("heading", { name: /Hébergement/ })).toBeVisible()
    await expect(page.getByText("Vercel Inc.")).toBeVisible()
  })

  test("displays intellectual property section", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(page.getByRole("heading", { name: /Propriété intellectuelle/ })).toBeVisible()
  })

  test("displays RGPD section with contact email", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(page.getByRole("heading", { name: /Données personnelles/ })).toBeVisible()
    await expect(page.getByText("rgpd@normandie.fr")).toBeVisible()
  })

  test("displays cookies section", async ({ page }) => {
    await page.goto("/mentions-legales")

    await expect(page.getByRole("heading", { name: /Cookies/ })).toBeVisible()
  })

  test("page is accessible via footer link", async ({ page }) => {
    await page.goto("/")

    const footerLink = page.locator("footer").getByRole("link", { name: "Mentions légales" })
    await footerLink.click()

    await expect(page).toHaveURL(/\/mentions-legales/)
  })
})
