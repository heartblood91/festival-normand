import { test, expect } from "@playwright/test"

test.describe("Admin Pages CRUD", () => {
  test("redirects unauthenticated user to login from pages list", async ({ page }) => {
    await page.goto("/admin/pages")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("redirects unauthenticated user from new page route", async ({ page }) => {
    await page.goto("/admin/pages/new")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("redirects unauthenticated user from edit page route", async ({ page }) => {
    await page.goto("/admin/pages/some-id/edit")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("callback URL preserves target for pages routes", async ({ page }) => {
    await page.goto("/admin/pages")
    await expect(page).toHaveURL(/\/admin\/login/)
    const url = page.url()
    expect(url).toContain("callbackUrl")
    expect(url).toContain("pages")
  })

  test("login page has no public navigation", async ({ page }) => {
    await page.goto("/admin/pages")
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator("nav[aria-label='Navigation principale']")).not.toBeVisible()
  })
})
