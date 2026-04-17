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
    await expect(page.getByRole("button", { name: /Se connecter/ })).toBeVisible()
  })

  test("login page has no public header navigation", async ({ page }) => {
    await page.goto("/admin/login")

    // Admin pages should NOT have the public navigation
    await expect(page.locator("nav[aria-label='Navigation principale']")).not.toBeVisible()
  })

  test("login page shows error for invalid credentials", async ({ page }) => {
    await page.goto("/admin/login")

    await page.getByLabel("Adresse email").fill("random@example.com")
    await page.getByLabel(/Mot de passe/).fill("wrong-password-123")
    await page.getByRole("button", { name: /Se connecter/ }).click()

    // Should show error toast
    await expect(page.getByText(/incorrect|erreur|invalid|not authorized/i).first()).toBeVisible({
      timeout: 10000,
    })
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

  test("login page email input is auto-focused", async ({ page }) => {
    await page.goto("/admin/login")

    const emailInput = page.getByLabel("Adresse email")
    await expect(emailInput).toBeFocused()
  })
})
