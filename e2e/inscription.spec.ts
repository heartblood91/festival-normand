import { test, expect } from "@playwright/test"

test.describe("Inscription page", () => {
  test("has correct title", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page).toHaveTitle(/Inscrivez votre événement/)
  })

  test("displays inscription introduction", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page.getByText("Vous êtes propriétaire ou gestionnaire")).toBeVisible()
  })

  test("renders YouTube video embed", async ({ page }) => {
    await page.goto("/inscription")

    const iframe = page.locator("iframe[src*='youtube-nocookie.com']")
    await expect(iframe).toBeVisible()
  })

  test("displays department registration links", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page.getByRole("link", { name: /Calvados — Formulaire/ })).toBeVisible()
    await expect(page.getByRole("link", { name: /Eure — Formulaire/ })).toBeVisible()
    await expect(page.getByRole("link", { name: /Manche — Formulaire/ })).toBeVisible()
    await expect(page.getByRole("link", { name: /Orne — Formulaire/ })).toBeVisible()
    await expect(page.getByRole("link", { name: /Seine-Maritime — Formulaire/ })).toBeVisible()
  })

  test("department links open in new tab", async ({ page }) => {
    await page.goto("/inscription")

    const calvadosLink = page.getByRole("link", { name: /Calvados — Formulaire/ })
    await expect(calvadosLink).toHaveAttribute("target", "_blank")
    await expect(calvadosLink).toHaveAttribute("rel", /noopener/)
  })

  test("displays participation criteria", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page.getByRole("heading", { name: /Critères de participation/ })).toBeVisible()
    await expect(page.getByText("Être un site patrimonial situé en Normandie")).toBeVisible()
  })

  test("displays registration deadline", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page.getByText("15 avril 2026")).toBeVisible()
  })

  test("page is accessible via header CTA button", async ({ page }) => {
    await page.goto("/")

    const ctaLink = page.locator("header").getByRole("link", { name: /Inscrivez votre événement/ })
    await ctaLink.click()

    await expect(page).toHaveURL(/\/inscription/)
  })
})
