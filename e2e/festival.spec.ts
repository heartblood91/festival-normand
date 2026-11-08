import { test, expect } from "@playwright/test"

test.describe("Festival page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/festival")

    await expect(page).toHaveTitle(/Pierres en Lumières.*festival unique|Le Festival/)
  })

  // Page copy is edited in the admin, so assert structure rather than wording.
  test("displays festival introduction", async ({ page }) => {
    await page.goto("/festival")

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    await expect(page.locator("article p").filter({ hasText: /2009/ }).first()).toBeVisible()
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

    await expect(page.getByText("pierresenlumieres@calvados.fr")).toBeVisible()
    await expect(page.getByText("patrimoines@eure.fr")).toBeVisible()
    await expect(page.getByText("patrimoine@manche.fr")).toBeVisible()
    await expect(page.getByText("jamet.juliette@orne.fr")).toBeVisible()
    await expect(page.getByText("patrimoine@seinemaritime.fr")).toBeVisible()
  })

  test("does not repeat the page title as a content heading", async ({ page }) => {
    await page.goto("/festival")

    const title = (await page.getByRole("heading", { level: 1 }).textContent())?.trim() ?? ""
    await expect(
      page
        .locator("article h2")
        .filter({ hasText: new RegExp(`^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`) })
    ).toHaveCount(0)
  })

  test("displays Fondation du Patrimoine section", async ({ page }) => {
    await page.goto("/festival")

    await expect(page.getByRole("heading", { name: /Fondation du Patrimoine/ })).toBeVisible()
    await expect(page.getByRole("link", { name: "Fondation du Patrimoine" })).toBeVisible()
  })

  test("page is accessible via header navigation", async ({ page }) => {
    await page.goto("/")

    const festivalLink = page
      .getByLabel("Navigation principale")
      .getByRole("link", { name: "Le Festival" })
    await festivalLink.click()

    await expect(page).toHaveURL(/\/festival/)
  })
})
