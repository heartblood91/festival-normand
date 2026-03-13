import { test, expect } from "@playwright/test"

test.describe("Admin Partners CRUD", () => {
  test("redirects unauthenticated user to login from partners list", async ({ page }) => {
    await page.goto("/admin/partners")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("redirects unauthenticated user from new partner page", async ({ page }) => {
    await page.goto("/admin/partners/new")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("redirects unauthenticated user from edit partner page", async ({ page }) => {
    await page.goto("/admin/partners/some-id/edit")
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("callback URL preserves target for partners pages", async ({ page }) => {
    await page.goto("/admin/partners")
    await expect(page).toHaveURL(/\/admin\/login/)
    const url = page.url()
    expect(url).toContain("callbackUrl")
    expect(url).toContain("partners")
  })

  test("login page has no public navigation", async ({ page }) => {
    await page.goto("/admin/partners")
    await expect(page).toHaveURL(/\/admin\/login/)
    await expect(page.locator("nav[aria-label='Navigation principale']")).not.toBeVisible()
  })
})
