import { test, expect } from "@playwright/test"

test.describe("Home page", () => {
  test("loads and displays the festival title", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Pierres en Lumières/)
    await expect(page.locator("h1")).toContainText("Pierres en Lumières")
  })

  test("displays the hero tagline", async ({ page }) => {
    await page.goto("/")
    await expect(
      page.getByText("Découvrez la magie du patrimoine normand en nocturne", { exact: true })
    ).toBeVisible()
  })

  test("displays hero CTA buttons", async ({ page }) => {
    await page.goto("/")
    const discoverBtn = page.getByRole("link", { name: "Découvrir le programme" }).first()
    await expect(discoverBtn).toBeVisible()
    await expect(discoverBtn).toHaveAttribute("href", /\/evenements$/)

    const mapBtn = page.getByRole("link", { name: "Voir la carte" })
    await expect(mapBtn).toBeVisible()
    await expect(mapBtn).toHaveAttribute("href", /\/evenements\?view=map$/)
  })

  test("displays the header city search", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    const searchInput = page.getByRole("searchbox", { name: /Rechercher un événement/i })
    await expect(searchInput).toBeVisible()
  })

  test("displays the editorial quote", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText(/comme métaphore, comme métier/)).toBeVisible()
  })

  test("displays a link to all news", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("link", { name: /Toutes les actualités/ })).toBeVisible()
  })

  test("displays editorial event cards", async ({ page }) => {
    await page.goto("/")
    const eventCards = page.locator('a[href*="/evenement/"]')
    expect(await eventCards.count()).toBeGreaterThanOrEqual(1)
  })

  test("displays the Normandy map section", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: /Toute la Normandie, allumée/ })).toBeVisible()
  })

  test("displays partners section", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByRole("heading", { name: /Partenaires & mécènes/ })).toBeVisible()
  })

  test("event card links navigate to event detail", async ({ page }) => {
    await page.goto("/")
    const eventCard = page.locator('a[href*="/evenement/"]').first()
    const href = await eventCard.getAttribute("href")
    expect(href).toMatch(/\/evenement\//)
  })
})
