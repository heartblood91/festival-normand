import { test, expect } from "@playwright/test"

test.describe("Inscription page", () => {
  test("loads the YouTube player only when asked, with a real title", async ({ page }) => {
    await page.goto("/inscription")
    const play = page.getByRole("button", { name: /^Lire la vidéo : / })
    test.skip((await play.count()) === 0, "page content has no video")

    await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0)
    await play.focus()
    await page.keyboard.press("Enter")
    const player = page.locator('iframe[src*="youtube-nocookie.com/embed/"]')
    await expect(player).toHaveCount(1)
    await expect(player).not.toHaveAttribute("title", /^https?:/)
  })

  test("has correct title", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page).toHaveTitle(/Comment vous inscrire|Inscr/)
  })

  // Page copy is edited in the admin, so assert structure rather than wording.
  test("displays a single inscription heading", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
    await expect(page.getByRole("heading", { level: 1, name: /inscri/i })).toBeVisible()
  })

  test("explains how to register", async ({ page }) => {
    await page.goto("/inscription")

    await expect(page.getByRole("heading", { level: 2, name: /inscri/i }).first()).toBeVisible()
  })

  test("shows the three registration steps first", async ({ page }) => {
    await page.goto("/inscription")

    const steps = page.getByRole("region", { name: /en 3 étapes/ })
    await expect(steps.getByRole("listitem")).toHaveCount(3)
    await steps.getByRole("link", { name: /Choisissez votre département/ }).click()
    await expect(page).toHaveURL(/#registration-links-heading/)
  })

  test("offers one card per department, opening its form in a new tab", async ({ page }) => {
    await page.goto("/inscription")

    const departments = page.getByRole("region", { name: "Choisissez votre département" })
    const cards = departments.getByRole("listitem")
    await expect(cards).toHaveCount(5)
    for (const name of ["Calvados", "Eure", "Manche", "Orne", "Seine-Maritime"]) {
      await expect(cards.filter({ hasText: name })).toHaveCount(1)
    }
    const links = departments.getByRole("link")
    expect(await links.count()).toBeGreaterThanOrEqual(1)
    await expect(links.first()).toHaveAttribute("href", /^https?:\/\//)
    await expect(links.first()).toHaveAttribute("target", "_blank")
    await expect(links.first()).toHaveAccessibleName(/nouvel onglet/)
  })

  test("page is accessible via header CTA button", async ({ page }) => {
    await page.goto("/")

    const ctaLink = page.locator("header").getByRole("link", { name: /Inscrire un événement/ })
    await ctaLink.click()

    await expect(page).toHaveURL(/\/inscription/)
  })
})
