import { test, expect } from "@playwright/test"

test.describe("Admin authentication", () => {
  test("redirects unauthenticated user to login page", async ({ page }) => {
    await page.goto("/admin")

    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test("redirects unauthenticated user from /admin/events to login", async ({ page }) => {
    await page.goto("/admin/events")

    await expect(page).toHaveURL(/\/admin\/login/)
    expect(page.url()).toContain("callbackUrl")
  })

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/admin/login")

    await expect(page.getByRole("heading", { name: "Pierres en Lumières" })).toBeVisible()
    await expect(page.getByText("Administration du festival")).toBeVisible()
    await expect(page.locator("[data-slot='card-title']").getByText("Connexion")).toBeVisible()
    await expect(page.getByLabel("Adresse email")).toBeVisible()
    await expect(page.getByRole("button", { name: /Envoyer le lien/ })).toBeVisible()
  })

  test("login page has no public header or footer", async ({ page }) => {
    await page.goto("/admin/login")

    // Admin pages should NOT have the public navigation
    await expect(page.locator("nav[aria-label='Navigation principale']")).not.toBeVisible()
  })

  test("login page shows error for non-admin email", async ({ page }) => {
    await page.goto("/admin/login")

    await page.getByLabel("Adresse email").fill("random@example.com")
    await page.getByRole("button", { name: /Envoyer le lien/ }).click()

    // Should show error toast
    await expect(page.getByText(/erreur|not authorized/i)).toBeVisible({ timeout: 10000 })
  })

  test("login page has correct meta robots noindex", async ({ page }) => {
    await page.goto("/admin/login")

    const robotsMeta = page.locator('meta[name="robots"]')
    await expect(robotsMeta).toHaveAttribute("content", /noindex/)
  })

  test("login page email input has correct attributes", async ({ page }) => {
    await page.goto("/admin/login")

    const emailInput = page.getByLabel("Adresse email")
    await expect(emailInput).toHaveAttribute("type", "email")
    await expect(emailInput).toHaveAttribute("autocomplete", "email")
    await expect(emailInput).toHaveAttribute("required", "")
  })

  test("login page is keyboard navigable", async ({ page }) => {
    await page.goto("/admin/login")

    // Tab to email input (should be auto-focused)
    const emailInput = page.getByLabel("Adresse email")
    await expect(emailInput).toBeFocused()

    // Tab to submit button
    await page.keyboard.press("Tab")
    const submitButton = page.getByRole("button", { name: /Envoyer le lien/ })
    await expect(submitButton).toBeFocused()
  })
})
