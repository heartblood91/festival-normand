import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
  test("loads and displays the festival title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Pierres en Lumières/);
    await expect(page.locator("h1")).toContainText("Pierres en Lumières");
  });

  test("displays the festival dates", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.locator("#main-content").getByText("29, 30 & 31 mai 2026")
    ).toBeVisible();
  });

  test("displays the tagline", async ({ page }) => {
    await page.goto("/");
    await expect(
      page
        .locator("#main-content")
        .getByText("Découvrez la magie du patrimoine normand en nocturne", {
          exact: true,
        })
    ).toBeVisible();
  });
});
