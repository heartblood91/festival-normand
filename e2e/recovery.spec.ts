import { test, expect } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"
import { hasDatabase, query } from "./helpers/db"

// R1: sites published on the v1 site (pierresenlumieres.fr) but missing here are
// recovered from the admin, without database access: dry-run list, drafts only,
// idempotent. The page reads the public v1 API (GET only).

test.describe("admin: sites to recover", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)
  test.skip(!hasDatabase(), "Needs DATABASE_URL to check the created draft")

  test("an editor imports a missing v1 site as a draft, once", async ({ page }) => {
    test.setTimeout(180_000)
    await loginAsEditor(page)
    await page.goto("/fr/admin/recovery")
    await expect(page.getByRole("heading", { level: 1, name: "Sites à récupérer" })).toBeVisible()
    await expect(
      page.getByRole("navigation", { name: "Édition de l'ancien site" }).getByRole("link", {
        name: "2026",
      })
    ).toHaveAttribute("aria-current", "page")

    const rows = page.getByTestId("recovery-row")
    const before = await rows.count()
    test.skip(before === 0, "Nothing left to recover from v1 2026")
    await expect(page.getByTestId("recovery-missing")).toHaveText(String(before))

    const first = rows.first()
    const tourinsoftId = await first.getAttribute("data-tourinsoft-id")
    const submit = page.getByRole("button", { name: /^Importer en brouillon/ })
    await expect(submit).toBeDisabled()
    await first.getByRole("checkbox").check()
    await expect(submit).toHaveText("Importer en brouillon (1)")

    try {
      await submit.click()
      await expect(page.getByRole("status")).toHaveText(/^1 site importé en brouillon\./, {
        timeout: 60_000,
      })
      const [created] = await query<{ published: boolean; slug: string }>(
        "select published, slug from events where tourinsoft_id = $1",
        [tourinsoftId]
      )
      expect(created?.published).toBe(false)
      const publicPage = await page.request.get(`/fr/evenement/${created.slug}`)
      expect(publicPage.status()).toBe(404)

      await page.reload()
      await expect(page.locator(`[data-tourinsoft-id="${tourinsoftId}"]`)).toHaveCount(0)
      await expect(rows).toHaveCount(before - 1)
    } finally {
      // Local fixture only: the app itself never deletes an event.
      await query("delete from events where tourinsoft_id = $1 and published = false", [
        tourinsoftId,
      ])
    }
  })

  test("the batch is capped and an empty selection cannot be sent", async ({ page }) => {
    test.setTimeout(120_000)
    await loginAsEditor(page)
    await page.goto("/fr/admin/recovery")
    const rows = page.getByTestId("recovery-row")
    test.skip((await rows.count()) <= 20, "Needs more than 20 sites to recover")
    await page.getByRole("button", { name: "Cocher les 20 premiers" }).click()
    await expect(page.getByRole("button", { name: /^Importer en brouillon/ })).toHaveText(
      "Importer en brouillon (20)"
    )
    await expect(rows.nth(20).getByRole("checkbox")).toBeDisabled()
    await page.getByRole("button", { name: "Tout décocher" }).click()
    await expect(page.getByRole("button", { name: /^Importer en brouillon/ })).toBeDisabled()
  })
})
