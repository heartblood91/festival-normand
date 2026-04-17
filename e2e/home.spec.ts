import { test, expect } from "@playwright/test"

test.describe("Home page", () => {
  test("loads and displays the festival title", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Pierres en Lumières/)
    await expect(page.locator("h1")).toContainText("Pierres en Lumières")
  })

  test("displays the hero section with dates and tagline", async ({ page }) => {
    await page.goto("/")
    await expect(page.getByText("29, 30 & 31 mai 2026", { exact: true }).first()).toBeVisible()
    await expect(
      page.getByText("Découvrez la magie du patrimoine normand en nocturne", { exact: true })
    ).toBeVisible()
  })

  test("displays CTA buttons in hero", async ({ page }) => {
    await page.goto("/")
    const discoverBtn = page.getByRole("link", { name: "Découvrir les événements" })
    await expect(discoverBtn).toBeVisible()
    await expect(discoverBtn).toHaveAttribute("href", /\/evenements$/)

    const registerBtn = page.getByRole("link", { name: "Inscrire un site" })
    await expect(registerBtn).toBeVisible()
    await expect(registerBtn).toHaveAttribute("href", /\/inscription$/)
  })

  test("displays search bar", async ({ page }) => {
    await page.goto("/")
    const searchInput = page.getByRole("combobox", { name: /Rechercher un événement/i })
    await expect(searchInput).toBeVisible()
  })

  test("displays featured events section with event cards", async ({ page }) => {
    await page.goto("/")
    const heading = page.getByRole("heading", { name: "Événements à la une" })
    await expect(heading).toBeVisible()

    const eventsSection = page.locator("section", { has: heading })
    const eventCards = eventsSection.locator('a[href*="/evenement/"]')
    const count = await eventCards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test("displays news carousel section", async ({ page }) => {
    await page.goto("/")
    const heading = page.getByRole("heading", { name: "Actualités", exact: true })
    await expect(heading).toBeVisible()
  })

  test("displays partners section", async ({ page }) => {
    await page.goto("/")
    const heading = page.getByRole("heading", { name: "Nos partenaires" })
    await expect(heading).toBeVisible()
  })

  test("event card links navigate to event detail", async ({ page }) => {
    await page.goto("/")
    const eventCard = page.locator('a[href*="/evenement/"]').first()
    const href = await eventCard.getAttribute("href")
    expect(href).toMatch(/\/evenement\//)
  })

  test("search bar shows autocomplete suggestions", async ({ page }) => {
    await page.goto("/")
    const searchInput = page.getByRole("combobox", { name: /Rechercher un événement/i })
    await searchInput.fill("Ca")
    const suggestions = page.locator("#city-suggestions")
    await expect(suggestions).toBeVisible()
  })
})
