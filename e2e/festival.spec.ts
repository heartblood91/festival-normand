import { test, expect } from "@playwright/test"

test.describe("Festival page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/festival")

    await expect(page).toHaveTitle(/Le Festival/)
  })

  test("displays festival introduction", async ({ page }) => {
    await page.goto("/festival")

    await expect(page.getByText("Pierres en Lumières est un événement festif")).toBeVisible()
  })

  test("renders all five department sections", async ({ page }) => {
    await page.goto("/festival")

    await expect(page.getByRole("heading", { name: /Calvados/ })).toBeVisible()
    await expect(page.getByRole("heading", { name: /Eure/ })).toBeVisible()
    await expect(page.getByRole("heading", { name: /Manche/ })).toBeVisible()
    await expect(page.getByRole("heading", { name: /Orne/ })).toBeVisible()
    await expect(page.getByRole("heading", { name: /Seine-Maritime/ })).toBeVisible()
  })

  test("each department has a contact email", async ({ page }) => {
    await page.goto("/festival")

    await expect(page.getByText("patrimoine@calvados.fr")).toBeVisible()
    await expect(page.getByText("patrimoine@eure.fr")).toBeVisible()
    await expect(page.getByText("patrimoine@manche.fr")).toBeVisible()
    await expect(page.getByText("patrimoine@orne.fr")).toBeVisible()
    await expect(page.getByText("patrimoine@seine-maritime.fr")).toBeVisible()
  })

  test("each department has an inscription link", async ({ page }) => {
    await page.goto("/festival")

    const inscriptionLinks = page.getByRole("link", { name: "Inscrivez-vous ici" })
    const count = await inscriptionLinks.count()
    expect(count).toBe(5)
  })

  test("displays Fondation du Patrimoine section", async ({ page }) => {
    await page.goto("/festival")

    await expect(page.getByRole("heading", { name: /Fondation du Patrimoine/ })).toBeVisible()
    await expect(page.getByRole("link", { name: "Fondation du Patrimoine" })).toBeVisible()
  })

  test("department images are displayed with alt text", async ({ page }) => {
    await page.goto("/festival")

    const images = page.locator("article img")
    const count = await images.count()
    expect(count).toBeGreaterThanOrEqual(5)

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt")
      expect(alt).toBeTruthy()
    }
  })

  test("inscription links open in new tab", async ({ page }) => {
    await page.goto("/festival")

    const inscriptionLinks = page.getByRole("link", { name: "Inscrivez-vous ici" })
    const firstLink = inscriptionLinks.first()
    await expect(firstLink).toHaveAttribute("target", "_blank")
    await expect(firstLink).toHaveAttribute("rel", /noopener/)
  })

  test("page is accessible via header navigation", async ({ page }) => {
    await page.goto("/")

    const festivalLink = page.getByLabel("Navigation principale").getByRole("link", { name: "Le Festival" })
    await festivalLink.click()

    await expect(page).toHaveURL(/\/festival/)
  })
})
