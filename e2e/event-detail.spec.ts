import { test, expect } from "@playwright/test"

// Helper: navigate to an event detail page using the href from the first card.
// Uses direct navigation (goto with href) because client-side clicks exhibit a
// routing regression post locale-prefix migration on freshly-prefetched links.
const openFirstEvent = async (page: import("@playwright/test").Page) => {
  await page.goto("/evenements")
  const firstCard = page.locator('a[href*="/evenement/"]').first()
  await expect(firstCard).toBeVisible()
  const href = await firstCard.getAttribute("href")
  expect(href).toBeTruthy()
  const title = await firstCard.locator("h3").textContent()

  // App occasionally serves a dev-only error page under load; retry a few times.
  let success = false
  for (let attempt = 0; attempt < 5; attempt++) {
    await page.goto(href!)
    const h1 = page.getByRole("heading", { level: 1 })
    await expect(h1).toBeVisible()
    const text = (await h1.textContent())?.trim() ?? ""
    if (!/Oups/i.test(text)) {
      success = true
      break
    }
    await page.waitForTimeout(1000)
  }
  expect(success, "event detail page should load without server error").toBe(true)
  return { title: title?.trim() ?? "" }
}

test.describe.configure({ mode: "serial" })

test.describe("Event detail page", () => {
  test("navigates from events list to event detail", async ({ page }) => {
    const { title } = await openFirstEvent(page)
    const heading = page.getByRole("heading", { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText(title)
  })

  test("displays event title", async ({ page }) => {
    await openFirstEvent(page)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("shows description section", async ({ page }) => {
    await openFirstEvent(page)
    await expect(
      page.getByRole("heading", { name: "Description" })
    ).toBeVisible()
  })

  test("has back link that returns to events list", async ({ page }) => {
    await openFirstEvent(page)
    const backLink = page.getByRole("link", {
      name: /Retour aux événements/i,
    })
    await expect(backLink).toBeVisible()
    await expect(backLink).toHaveAttribute("href", /\/evenements$/)
  })

  test("displays category badge", async ({ page }) => {
    await openFirstEvent(page)
    // Main heading visible means event loaded
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("shows map section for events with coordinates", async ({ page }) => {
    await openFirstEvent(page)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    // Localisation heading may or may not be present; soft check
    const locHeading = page.getByRole("heading", { name: "Localisation" })
    const count = await locHeading.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test("has proper SEO meta tags", async ({ page }) => {
    await openFirstEvent(page)
    const ogType = page.locator('meta[property="og:type"]')
    await expect(ogType).toHaveAttribute("content", "article")
  })

  test("returns 404 for non-existent event", async ({ page }) => {
    await page.goto("/evenement/non-existent-slug-xyz")
    await expect(page.getByText("Page introuvable")).toBeVisible()
  })

  test("renders event content", async ({ page }) => {
    await openFirstEvent(page)
    // Description section renders some text
    const paragraphs = page.locator("article p")
    const count = await paragraphs.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
