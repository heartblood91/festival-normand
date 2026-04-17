import { test, expect } from "@playwright/test"

test.describe("Global layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("header displays logo and navigation links", async ({ page }) => {
    const header = page.locator("header")
    await expect(header).toBeVisible()
    await expect(header.getByText("Pierres en Lumières").first()).toBeVisible()

    // Desktop nav links (hidden on mobile, visible on lg)
    const nav = header.locator('nav[aria-label="Navigation principale"]')
    await expect(nav.getByText("Accueil")).toBeVisible()
    await expect(nav.getByText("Événements")).toBeVisible()
    await expect(nav.getByText("Actualités")).toBeVisible()
    await expect(nav.getByText("Le Festival")).toBeVisible()
    await expect(nav.getByText("Contact")).toBeVisible()
  })

  test("header has social links", async ({ page }) => {
    const header = page.locator("header")
    await expect(header.getByLabel("Facebook")).toBeVisible()
    await expect(header.getByLabel("Instagram")).toBeVisible()
  })

  test("header has CTA button", async ({ page }) => {
    const header = page.locator("header")
    await expect(header.getByRole("link", { name: "Inscrivez votre événement" })).toBeVisible()
  })

  test("footer displays navigation", async ({ page }) => {
    const footer = page.locator("footer")
    await expect(footer).toBeVisible()
    await expect(footer.getByRole("link", { name: /Pierres en Lumières/ }).first()).toBeVisible()
    await expect(footer.getByText("Navigation")).toBeVisible()
    await expect(footer.getByRole("heading", { name: "Contact" })).toBeVisible()
  })

  test("footer has social links", async ({ page }) => {
    const footer = page.locator("footer")
    await expect(footer.getByLabel("Facebook")).toBeVisible()
    await expect(footer.getByLabel("Instagram")).toBeVisible()
  })

  test("skip-nav link is attached and becomes visible on focus", async ({ page }) => {
    const skipNav = page.getByText("Aller au contenu principal")
    await expect(skipNav).toBeAttached()

    await skipNav.focus()
    await expect(skipNav).toBeVisible()
  })

  test("navigation links have correct locale-prefixed hrefs", async ({ page }) => {
    const nav = page.locator('nav[aria-label="Navigation principale"]')
    await expect(nav.getByText("Accueil")).toHaveAttribute("href", /^\/fr\/?$/)
    await expect(nav.getByText("Événements")).toHaveAttribute("href", /\/evenements$/)
    await expect(nav.getByText("Actualités")).toHaveAttribute("href", /\/actualites$/)
    await expect(nav.getByText("Le Festival")).toHaveAttribute("href", /\/festival$/)
    await expect(nav.getByText("Contact")).toHaveAttribute("href", /\/contact$/)
  })

  test("active page link is highlighted", async ({ page }) => {
    // On homepage, "Accueil" should have aria-current="page"
    const nav = page.locator('nav[aria-label="Navigation principale"]')
    const homeLink = nav.getByText("Accueil")
    await expect(homeLink).toHaveAttribute("aria-current", "page")
  })
})

test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 375, height: 812 } })

  test("mobile menu opens and displays links", async ({ page }) => {
    await page.goto("/")

    // Desktop nav should be hidden on mobile
    const desktopNav = page.locator('nav[aria-label="Navigation principale"]')
    await expect(desktopNav).toBeHidden()

    // Mobile menu button should be visible
    const menuButton = page.getByLabel("Ouvrir le menu")
    await expect(menuButton).toBeVisible()

    // Open mobile menu
    await menuButton.click()

    // Mobile nav sheet content appears
    const sheetContent = page.locator("#mobile-nav")
    await expect(sheetContent).toBeVisible()
    await expect(sheetContent.getByRole("link", { name: "Accueil" })).toBeVisible()
    await expect(sheetContent.getByRole("link", { name: "Événements" })).toBeVisible()
  })

  test("mobile menu closes on link click", async ({ page }) => {
    await page.goto("/")

    const menuButton = page.getByLabel("Ouvrir le menu")
    await menuButton.click()

    const sheetContent = page.locator("#mobile-nav")
    await expect(sheetContent).toBeVisible()

    // Click a nav link
    await sheetContent.getByRole("link", { name: "Contact" }).click()

    // Menu should close (sheet is removed from DOM or hidden)
    await expect(sheetContent).toBeHidden()
  })
})
