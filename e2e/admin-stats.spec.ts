import { test, expect } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

test.describe("Admin stats", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)

  test("shows site figures from the database and explains the audience setup", async ({ page }) => {
    await loginAsEditor(page)
    await page.goto("/fr/admin")
    await page.getByRole("link", { name: "Statistiques" }).click()
    await expect(page.getByRole("heading", { level: 1, name: "Statistiques" })).toBeVisible()

    const online = page.locator("dt", { hasText: "Sites en ligne" }).locator("+ dd")
    expect(Number((await online.textContent())?.replace(/\D/g, ""))).toBeGreaterThan(0)
    for (const title of [
      "Sites par département",
      "Sites par type d'animation",
      "Qualité des fiches",
    ]) {
      await expect(page.getByRole("heading", { level: 2, name: title })).toBeVisible()
    }
    await expect(page.getByText("Calvados")).toBeVisible()
    // CI has no PostHog key: the page says how to enable it instead of failing.
    if (!process.env.POSTHOG_PERSONAL_API_KEY) {
      await expect(
        page.getByRole("status").filter({ hasText: "POSTHOG_PERSONAL_API_KEY" })
      ).toBeVisible()
    }
  })
})
