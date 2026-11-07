import { test, expect } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR, republishEvent } from "./helpers/admin"

test.describe("Admin Tourinsoft events and unpublishing", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)

  test.beforeEach(async ({ page }) => {
    await loginAsEditor(page)
  })

  test("the source filter lists Tourinsoft events with their badge", async ({ page }) => {
    await page.goto("/fr/admin/events?source=tourinsoft")
    const rows = page.locator("tbody tr")
    await expect(rows.first()).toBeVisible()
    const count = await rows.count()
    await expect(rows.filter({ hasText: "Tourinsoft" })).toHaveCount(count)

    await page.goto("/fr/admin/events?source=manual")
    await expect(page.locator("tbody tr").first()).toBeVisible()
    await expect(page.locator("tbody tr").filter({ hasText: "Tourinsoft" })).toHaveCount(0)
  })

  test("a Tourinsoft event says which fields the sync overwrites", async ({ page }) => {
    await page.goto("/fr/admin/events?source=tourinsoft")
    await page
      .getByRole("link", { name: /^Modifier / })
      .first()
      .click()
    const banner = page.getByRole("region", { name: "Fiche synchronisée depuis Tourinsoft" })
    await expect(banner).toBeVisible()
    await banner.getByText("Champs remplacés par la synchronisation").click()
    await expect(banner).toContainText("Titre (FR), Description (FR)")
  })

  test("events can only be unpublished from the list, never deleted", async ({ page }) => {
    await page.goto("/fr/admin/events?status=published")
    await expect(page.getByRole("button", { name: /^Supprimer/ })).toHaveCount(0)

    // admin-publish edits the first and last rows: stay clear of them in parallel runs.
    const row = page.locator("tbody tr").nth(1)
    const title = (await row.locator("td").nth(1).locator("span").first().textContent())!.trim()
    const editHref = await row.getByRole("link", { name: /^Modifier / }).getAttribute("href")
    const editUrl = `/fr${editHref}`

    try {
      await row.getByRole("button", { name: `Dépublier ${title}` }).click()
      const confirm = page.getByRole("alertdialog")
      await expect(confirm).toContainText("peut être republié")
      await confirm.getByRole("button", { name: "Dépublier" }).click()
      await expect(page.getByText("1 événement dépublié.")).toBeVisible()

      await page.goto("/fr/admin/events?status=depublished")
      await expect(page.getByRole("link", { name: `Modifier ${title}` })).toBeVisible()
    } finally {
      await republishEvent(page, editUrl)
    }
  })
})
