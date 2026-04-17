import { test, expect } from "@playwright/test"

test.describe("Contact page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/contact")
  })

  test("renders page with correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Contact/)
    await expect(
      page.getByRole("heading", { name: "Contactez-nous", level: 1 })
    ).toBeVisible()
  })

  test("renders info section with description", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Nous écrire" })
    ).toBeVisible()
    await expect(
      page.getByText("Une question sur le festival").first()
    ).toBeVisible()
  })

  test("renders inscription CTA link in main content", async ({ page }) => {
    const main = page.locator("main")
    await expect(
      main.getByRole("heading", { name: "Inscrivez votre événement" })
    ).toBeVisible()
    const ctaLink = main.getByRole("link", { name: /S'inscrire/ })
    await expect(ctaLink).toBeVisible()
    await expect(ctaLink).toHaveAttribute("href", /\/inscription$/)
  })

  test("renders contact form with all fields", async ({ page }) => {
    await expect(page.getByLabel(/Nom complet/)).toBeVisible()
    await expect(page.locator("#email")).toBeVisible()
    await expect(page.getByLabel(/Département/)).toBeVisible()
    await expect(page.getByLabel(/Message/)).toBeVisible()
    await expect(
      page.getByRole("button", { name: /Envoyer/ })
    ).toBeVisible()
  })

  test("department select has all 5 departments", async ({ page }) => {
    const select = page.getByLabel(/Département/)
    await expect(select.locator("option")).toHaveCount(6) // 5 + placeholder
    await expect(
      select.locator("option", { hasText: "Calvados" })
    ).toBeAttached()
    await expect(
      select.locator("option", { hasText: "Seine-Maritime" })
    ).toBeAttached()
  })

  test("shows validation errors when submitting empty form", async ({
    page,
  }) => {
    // Fill only name with too-short value to trigger validation
    await page.getByLabel(/Nom complet/).fill("J")
    await page.getByRole("button", { name: /Envoyer/ }).click()

    // Server-side validation should return field errors
    await expect(page.getByText(/au moins 2 caractères/)).toBeVisible({
      timeout: 10000,
    })
  })

  test("shows email validation error for invalid email", async ({ page }) => {
    await page.getByLabel(/Nom complet/).fill("Jean Dupont")
    await page.locator("#email").fill("not-an-email")
    await page.getByLabel(/Département/).selectOption("CALVADOS")
    await page
      .getByLabel(/Message/)
      .fill(
        "Ceci est un message de test pour le formulaire de contact."
      )
    await page.getByRole("button", { name: /Envoyer/ }).click()

    await expect(page.getByText(/email invalide/i)).toBeVisible({
      timeout: 10000,
    })
  })

  test("form submission does not crash", async ({ page }) => {
    await page.getByLabel(/Nom complet/).fill("Jean Dupont")
    await page.locator("#email").fill("jean@example.fr")
    await page.getByLabel(/Département/).selectOption("CALVADOS")
    await page
      .getByLabel(/Message/)
      .fill(
        "Ceci est un message de test pour le formulaire de contact."
      )
    await page.getByRole("button", { name: /Envoyer/ }).click()

    // Form responds (either success/error toast or stays rendered)
    await expect(page.getByLabel(/Nom complet/)).toBeVisible({ timeout: 10000 })
  })

  test("navigates to contact page from header nav", async ({ page }) => {
    await page.goto("/")
    const navLink = page
      .getByLabel("Navigation principale")
      .getByRole("link", { name: "Contact" })
    await navLink.click()
    await expect(page).toHaveURL(/\/contact/)
  })

  test("honeypot field is hidden from users", async ({ page }) => {
    // The honeypot is positioned off-screen with absolute positioning
    const honeypotContainer = page.locator("[aria-hidden='true']").filter({
      has: page.locator("#honeypot"),
    })
    await expect(honeypotContainer).toBeAttached()
    // Verify it's not visually visible (positioned off-screen)
    const box = await honeypotContainer.boundingBox()
    // Should be positioned far off-screen (left: -9999px)
    expect(box === null || box.x < 0).toBeTruthy()
  })
})
