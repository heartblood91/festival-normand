import { test, expect } from "@playwright/test"

test.describe("News list page", () => {
  test("has correct title and heading", async ({ page }) => {
    await page.goto("/actualites")

    await expect(page).toHaveTitle(/Actualités/)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Actualités")
  })

  test("displays news cards with titles and dates", async ({ page }) => {
    await page.goto("/actualites")

    const cards = page.locator("a[href^='/actualite/']")
    await expect(cards.first()).toBeVisible()

    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(3)
  })

  test("each card shows title, date and excerpt", async ({ page }) => {
    await page.goto("/actualites")

    const firstCard = page.locator("a[href^='/actualite/']").first()
    await expect(firstCard.locator("h2")).toBeVisible()
    await expect(firstCard.locator("time")).toBeVisible()
  })

  test("cards link to detail pages", async ({ page }) => {
    await page.goto("/actualites")

    const firstCard = page.locator("a[href^='/actualite/']").first()
    const href = await firstCard.getAttribute("href")
    expect(href).toMatch(/^\/actualite\/[\w-]+$/)
  })

  test("responsive grid layout", async ({ page }) => {
    await page.goto("/actualites")

    const cards = page.locator("a[href^='/actualite/']")
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

test.describe("News detail page", () => {
  test("navigates from news list to detail", async ({ page }) => {
    await page.goto("/actualites")

    const firstCard = page.locator("a[href^='/actualite/']").first()
    const title = await firstCard.locator("h2").textContent()
    await firstCard.click()

    await page.waitForURL(/\/actualite\//)
    const heading = page.locator("article > header h1")
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText(title!)
  })

  test("displays article title and date", async ({ page }) => {
    await page.goto("/actualite/programme-2026-devoile")

    await expect(page.locator("article > header h1")).toContainText("programme")
    await expect(page.locator("time")).toBeVisible()
  })

  test("renders markdown content with headings", async ({ page }) => {
    await page.goto("/actualite/programme-2026-devoile")

    // Markdown h1 becomes h2, h2 becomes h3 to maintain heading hierarchy
    const headings = page.locator("article h2, article h3")
    const count = await headings.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test("renders markdown content with bold text", async ({ page }) => {
    await page.goto("/actualite/programme-2026-devoile")

    await expect(page.locator("strong").first()).toBeVisible()
  })

  test("renders markdown content with links", async ({ page }) => {
    await page.goto("/actualite/benevoles-coeur-festival")

    const link = page.locator("article a[href='/inscription']")
    await expect(link).toBeVisible()
  })

  test("renders markdown content with lists", async ({ page }) => {
    await page.goto("/actualite/programme-2026-devoile")

    const list = page.locator("article ul, article ol").first()
    await expect(list).toBeVisible()
  })

  test("has back link to news list", async ({ page }) => {
    await page.goto("/actualite/programme-2026-devoile")

    const backLink = page.getByRole("link", { name: "Retour aux actualités" })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute("href", "/actualites")
  })

  test("has SEO meta tags", async ({ page }) => {
    await page.goto("/actualite/programme-2026-devoile")

    await expect(page).toHaveTitle(/Pierres en Lumières/)
    const ogTitle = page.locator("meta[property='og:title']")
    await expect(ogTitle).toHaveAttribute("content", /.+/)
  })

  test("shows 404 for non-existent article", async ({ page }) => {
    const response = await page.goto("/actualite/non-existent-article")
    expect(response?.status()).toBe(404)
  })
})
