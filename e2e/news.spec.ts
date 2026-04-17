import { test, expect } from "@playwright/test"

test.describe("News list page", () => {
  test("has correct title and heading", async ({ page }) => {
    await page.goto("/actualites")

    await expect(page).toHaveTitle(/Actualités/)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Actualités")
  })

  test("displays news cards with titles and dates", async ({ page }) => {
    await page.goto("/actualites")

    const cards = page.locator('a[href*="/actualite/"]')
    await expect(cards.first()).toBeVisible()

    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test("each card shows title and date", async ({ page }) => {
    await page.goto("/actualites")

    const firstCard = page.locator('a[href*="/actualite/"]').first()
    await expect(firstCard.locator("h2")).toBeVisible()
    await expect(firstCard.locator("time")).toBeVisible()
  })

  test("cards link to detail pages", async ({ page }) => {
    await page.goto("/actualites")

    const firstCard = page.locator('a[href*="/actualite/"]').first()
    const href = await firstCard.getAttribute("href")
    expect(href).toMatch(/\/actualite\/[\w-]+$/)
  })

  test("responsive grid layout", async ({ page }) => {
    await page.goto("/actualites")

    const cards = page.locator('a[href*="/actualite/"]')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})

test.describe("News detail page", () => {
  test("navigates from news list to detail", async ({ page }) => {
    await page.goto("/actualites")
    const firstCard = page.locator('a[href*="/actualite/"]').first()
    const title = (await firstCard.locator("h2").textContent())?.trim() ?? ""
    const href = await firstCard.getAttribute("href")
    await page.goto(href!)

    const heading = page.locator("article > header h1")
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText(title)
  })

  test("displays article title and date", async ({ page }) => {
    await page.goto("/actualites")
    const firstCard = page.locator('a[href*="/actualite/"]').first()
    const href = await firstCard.getAttribute("href")
    await page.goto(href!)

    await expect(page.locator("article > header h1")).toBeVisible()
    await expect(page.locator("time").first()).toBeVisible()
  })

  test("renders article content", async ({ page }) => {
    await page.goto("/actualites")
    const firstCard = page.locator('a[href*="/actualite/"]').first()
    const href = await firstCard.getAttribute("href")
    await page.goto(href!)

    // Article has a body with some rendered content
    const body = page.locator("article")
    await expect(body).toBeVisible()
    const text = (await body.textContent()) ?? ""
    expect(text.trim().length).toBeGreaterThan(0)
  })

  test("has back link to news list", async ({ page }) => {
    await page.goto("/actualites")
    const firstCard = page.locator('a[href*="/actualite/"]').first()
    const href = await firstCard.getAttribute("href")
    await page.goto(href!)

    const backLink = page.getByRole("link", { name: "Retour aux actualités" })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute("href", /\/actualites$/)
  })

  test("has SEO meta tags", async ({ page }) => {
    await page.goto("/actualites")
    const firstCard = page.locator('a[href*="/actualite/"]').first()
    const href = await firstCard.getAttribute("href")
    if (href) await page.goto(href)

    const ogTitle = page.locator("meta[property='og:title']")
    await expect(ogTitle).toHaveAttribute("content", /.+/)
  })

  test("shows 404 for non-existent article", async ({ page }) => {
    await page.goto("/actualite/non-existent-article")
    await expect(page.getByText("Page introuvable")).toBeVisible()
  })
})
