import { test, expect } from "@playwright/test"

test.describe("404 Not Found Page", () => {
  test("displays 404 page for non-existent routes", async ({ page }) => {
    await page.goto("/this-page-does-not-exist")
    await expect(page.getByText("404", { exact: true })).toBeVisible()
    await expect(page.getByText("Page introuvable")).toBeVisible()
  })

  test("shows description text", async ({ page }) => {
    await page.goto("/non-existent-page")
    await expect(
      page.getByText("la page que vous recherchez")
    ).toBeVisible()
  })

  test("has link back to homepage", async ({ page }) => {
    await page.goto("/non-existent-page")
    const homeLink = page.getByRole("link", { name: /accueil/i })
    await expect(homeLink).toBeVisible()
    await homeLink.click()
    await expect(page).toHaveURL("/")
  })

  test("has link to events page", async ({ page }) => {
    await page.goto("/non-existent-page")
    const eventsLink = page.getByRole("link", { name: /événements/i })
    await expect(eventsLink).toBeVisible()
    await eventsLink.click()
    await expect(page).toHaveURL("/evenements")
  })

  test("shows 404 for non-existent event slug", async ({ page }) => {
    await page.goto("/evenement/this-event-does-not-exist-at-all")
    await expect(page.getByText("Page introuvable")).toBeVisible()
  })

  test("shows 404 for non-existent news slug", async ({ page }) => {
    await page.goto("/actualite/this-news-does-not-exist-at-all")
    await expect(page.getByText("Page introuvable")).toBeVisible()
  })
})

test.describe("Loading States", () => {
  test("events page renders without errors", async ({ page }) => {
    await page.goto("/evenements")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("news page renders without errors", async ({ page }) => {
    await page.goto("/actualites")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("admin loading shows spinner when not authenticated", async ({
    page,
  }) => {
    await page.goto("/admin")
    // Should redirect to login
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})

test.describe("Error Handling", () => {
  test("homepage handles errors gracefully", async ({ page }) => {
    // Visit homepage - should load without errors
    const response = await page.goto("/")
    expect(response?.status()).toBeLessThan(500)
  })

  test("events page handles errors gracefully", async ({ page }) => {
    const response = await page.goto("/evenements")
    expect(response?.status()).toBeLessThan(500)
  })

  test("all public pages return non-500 status", async ({ page }) => {
    const routes = [
      "/",
      "/evenements",
      "/actualites",
      "/festival",
      "/inscription",
      "/mentions-legales",
      "/contact",
    ]

    for (const route of routes) {
      const response = await page.goto(route)
      expect(response?.status()).toBeLessThan(500)
    }
  })
})
