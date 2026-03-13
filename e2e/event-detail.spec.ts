import { test, expect } from "@playwright/test"

test.describe("Event detail page", () => {
  test("navigates from events list to event detail", async ({ page }) => {
    await page.goto("/evenements")
    const firstCard = page.locator("a[href^='/evenement/']").first()
    const title = await firstCard.locator("h3").textContent()
    await firstCard.click()

    await page.waitForURL(/\/evenement\//)
    const heading = page.getByRole("heading", { level: 1 })
    await expect(heading).toBeVisible()
    await expect(heading).toHaveText(title!)
  })

  test("displays event title and location badge", async ({ page }) => {
    await page.goto("/evenements")
    const firstCard = page.locator("a[href^='/evenement/']").first()
    await firstCard.click()
    await page.waitForURL(/\/evenement\//)

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByText(/—/)).toBeVisible()
  })

  test("shows practical info section", async ({ page }) => {
    await page.goto("/evenements")
    const firstCard = page.locator("a[href^='/evenement/']").first()
    await firstCard.click()
    await page.waitForURL(/\/evenement\//)

    await expect(
      page.getByRole("heading", { name: "Informations pratiques" })
    ).toBeVisible()
  })

  test("shows description section", async ({ page }) => {
    await page.goto("/evenements")
    const firstCard = page.locator("a[href^='/evenement/']").first()
    await firstCard.click()
    await page.waitForURL(/\/evenement\//)

    await expect(
      page.getByRole("heading", { name: "Description" })
    ).toBeVisible()
  })

  test("has back button that returns to events list", async ({ page }) => {
    await page.goto("/evenements")
    const firstCard = page.locator("a[href^='/evenement/']").first()
    await firstCard.click()
    await page.waitForURL(/\/evenement\//)

    const backLink = page.getByRole("link", {
      name: /Retour aux événements/i,
    })
    await expect(backLink).toBeVisible()
    await backLink.click()
    await page.waitForURL("/evenements")
  })

  test("displays category and department badges", async ({ page }) => {
    await page.goto("/evenements")
    const firstCard = page.locator("a[href^='/evenement/']").first()
    await firstCard.click()
    await page.waitForURL(/\/evenement\//)

    // Wait for event detail content to load
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()

    // Category and department badges should be visible
    const badges = page.locator("span.rounded-full")
    const count = await badges.count()
    expect(count).toBeGreaterThanOrEqual(2)
  })

  test("shows map section for events with coordinates", async ({ page }) => {
    await page.goto("/evenements")
    const firstCard = page.locator("a[href^='/evenement/']").first()
    await firstCard.click()
    await page.waitForURL(/\/evenement\//)

    await expect(
      page.getByRole("heading", { name: "Localisation" })
    ).toBeVisible()
  })

  test("has proper SEO meta tags", async ({ page }) => {
    await page.goto("/evenements")
    const firstCard = page.locator("a[href^='/evenement/']").first()
    await firstCard.click()
    await page.waitForURL(/\/evenement\//)

    // Wait for the page heading to be visible before checking title
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page).toHaveTitle(/Pierres en Lumières/)
  })

  test("returns 404 for non-existent event", async ({ page }) => {
    await page.goto("/evenement/non-existent-slug-xyz")
    await expect(page.getByText("Page introuvable")).toBeVisible()
  })

  test("displays date and time information", async ({ page }) => {
    await page.goto("/evenements")
    const firstCard = page.locator("a[href^='/evenement/']").first()
    await firstCard.click()
    await page.waitForURL(/\/evenement\//)

    // Check date label is shown in info section
    await expect(page.getByText("Date", { exact: true })).toBeVisible()
  })
})
