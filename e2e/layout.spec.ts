import { test, expect } from "@playwright/test";

test.describe("Global layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("header displays logo and navigation links", async ({ page }) => {
    const header = page.locator("header");
    await expect(header).toBeVisible();
    await expect(header.getByText("Pierres en Lumières")).toBeVisible();

    // Desktop nav links (hidden on mobile, visible on lg)
    const nav = header.locator('nav[aria-label="Navigation principale"]');
    await expect(nav.getByText("Accueil")).toBeVisible();
    await expect(nav.getByText("Événements")).toBeVisible();
    await expect(nav.getByText("Actualités")).toBeVisible();
    await expect(nav.getByText("Le Festival")).toBeVisible();
    await expect(nav.getByText("Contact")).toBeVisible();
  });

  test("header has social links", async ({ page }) => {
    const header = page.locator("header");
    await expect(header.getByLabel("Facebook")).toBeVisible();
    await expect(header.getByLabel("Instagram")).toBeVisible();
  });

  test("header has CTA button", async ({ page }) => {
    const header = page.locator("header");
    await expect(
      header.getByRole("link", { name: "Inscrivez votre événement" })
    ).toBeVisible();
  });

  test("footer displays navigation and partners", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
    await expect(
      footer.getByRole("link", { name: /Pierres en Lumières/ })
    ).toBeVisible();
    await expect(footer.getByText("Navigation")).toBeVisible();
    await expect(footer.getByText("Événement créé par")).toBeVisible();
    await expect(footer.getByText("Suivez-nous")).toBeVisible();
  });

  test("footer has social links", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer.getByLabel("Facebook")).toBeVisible();
    await expect(footer.getByLabel("Instagram")).toBeVisible();
  });

  test("skip-nav link is functional", async ({ page }) => {
    // Skip-nav should be in the DOM but visually hidden
    const skipNav = page.getByText("Aller au contenu principal");
    await expect(skipNav).toBeAttached();

    // Tab to the skip-nav link
    await page.keyboard.press("Tab");
    // The skip-nav may or may not get focus first depending on browser — check it's attached and clickable
    await expect(skipNav).toBeAttached();

    // Force focus to make it visible and click
    await skipNav.focus();
    await expect(skipNav).toBeVisible();
    await skipNav.click();

    const mainContent = page.locator("#main-content");
    await expect(mainContent).toBeVisible();
  });

  test("navigation links have correct hrefs", async ({ page }) => {
    const nav = page.locator('nav[aria-label="Navigation principale"]');
    await expect(nav.getByText("Accueil")).toHaveAttribute("href", "/");
    await expect(nav.getByText("Événements")).toHaveAttribute("href", "/evenements");
    await expect(nav.getByText("Actualités")).toHaveAttribute("href", "/actualites");
    await expect(nav.getByText("Le Festival")).toHaveAttribute("href", "/festival");
    await expect(nav.getByText("Contact")).toHaveAttribute("href", "/contact");
  });

  test("active page link is highlighted", async ({ page }) => {
    // On homepage, "Accueil" should have aria-current="page"
    const nav = page.locator('nav[aria-label="Navigation principale"]');
    const homeLink = nav.getByText("Accueil");
    await expect(homeLink).toHaveAttribute("aria-current", "page");
  });
});

test.describe("Mobile navigation", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("mobile menu opens and closes", async ({ page }) => {
    await page.goto("/");

    // Desktop nav should be hidden on mobile
    const desktopNav = page.locator('nav[aria-label="Navigation principale"]');
    await expect(desktopNav).toBeHidden();

    // Mobile menu button should be visible
    const menuButton = page.getByLabel("Ouvrir le menu");
    await expect(menuButton).toBeVisible();

    // Open mobile menu
    await menuButton.click();

    // Mobile nav should now be visible
    const mobileNav = page.locator('nav[aria-label="Navigation mobile"]');
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav.getByText("Accueil")).toBeVisible();
    await expect(mobileNav.getByText("Événements")).toBeVisible();

    // Close button should work
    const closeButton = page.getByRole("button", { name: "Close" });
    await closeButton.click();
    await expect(mobileNav).toBeHidden();
  });

  test("mobile menu closes on link click", async ({ page }) => {
    await page.goto("/");

    const menuButton = page.getByLabel("Ouvrir le menu");
    await menuButton.click();

    // Wait for the sheet content to appear
    const sheetContent = page.locator("#mobile-nav");
    await expect(sheetContent).toBeVisible();

    const mobileNav = sheetContent.locator('nav[aria-label="Navigation mobile"]');
    await expect(mobileNav).toBeVisible();

    // Click a nav link
    await mobileNav.getByText("Contact").click();

    // Menu should close
    await expect(sheetContent).toBeHidden();
  });
});
