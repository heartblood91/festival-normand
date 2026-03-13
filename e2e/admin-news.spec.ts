import { test, expect } from "@playwright/test"

test.describe("Admin News CRUD", () => {
  test("redirects unauthenticated user to login from news list", async ({ page }) => {
    await page.goto("/admin/news")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("redirects unauthenticated user from new news page", async ({ page }) => {
    await page.goto("/admin/news/new")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("redirects unauthenticated user from edit news page", async ({ page }) => {
    await page.goto("/admin/news/some-id/edit")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("callback URL preserves target for news pages", async ({ page }) => {
    await page.goto("/admin/news")
    await expect(page).toHaveURL(/\/admin\/login/)
    const url = page.url()
    expect(url).toContain("callbackUrl")
    expect(url).toContain("news")
  })

  test("login page has no public navigation", async ({ page }) => {
    await page.goto("/admin/news")
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator("nav[aria-label='Navigation principale']")).not.toBeVisible()
  })
})
