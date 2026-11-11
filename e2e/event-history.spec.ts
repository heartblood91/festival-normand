import { test, expect, type Page } from "@playwright/test"
import {
  describeCoverIfMissing,
  editorCredentials,
  loginAsEditor,
  MISSING_EDITOR,
} from "./helpers/admin"
import { hasDatabase, query } from "./helpers/db"

// Meeting item #30: link each site to its history (Wikipedia or the official site).
// The field belongs to the editors: the Tourinsoft sync never writes it.

const HISTORY = "https://fr.wikipedia.org/wiki/Abbaye_aux_Hommes"

const saveHistory = async (page: Page, id: string, url: string) => {
  await page.goto(`/fr/admin/events/${id}/edit`)
  await describeCoverIfMissing(page)
  await page.getByLabel("Histoire du lieu").fill(url)
  await page.getByRole("button", { name: "Mettre à jour" }).first().click()
  await expect(page).toHaveURL(/\/admin\/events$/, { timeout: 15_000 })
}

test.describe("place history link", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)
  test.skip(!hasDatabase(), "Needs DATABASE_URL to pick an event")

  test("an editor links the place history, shown on the event page in both languages", async ({
    page,
  }) => {
    test.setTimeout(120_000)
    const [event] = await query<{ id: string; slug: string }>(
      "select id, slug from events where published and history_url is null order by slug desc limit 1"
    )
    test.skip(!event, "No published event without a history link")
    await loginAsEditor(page)
    try {
      await saveHistory(page, event.id, HISTORY)

      await page.goto(`/fr/evenement/${event.slug}`)
      const link = page.getByRole("link", { name: /^Histoire du lieu.*nouvel onglet/ })
      await expect(link).toHaveAttribute("href", HISTORY)
      await expect(link).toHaveAttribute("target", "_blank")
      await expect(link).toHaveAttribute("rel", /noopener/)
      await expect(link).toHaveAccessibleName(/^Histoire du lieu fr\.wikipedia\.org/)

      await page.goto(`/en/evenement/${event.slug}`)
      await expect(
        page.getByRole("link", { name: /^History of the place.*new tab/ })
      ).toHaveAttribute("href", HISTORY)
    } finally {
      await saveHistory(page, event.id, "")
    }
    await page.goto(`/fr/evenement/${event.slug}`)
    await expect(page.getByRole("link", { name: /^Histoire du lieu/ })).toHaveCount(0)
  })

  test("a link that is not a web address is refused", async ({ page }) => {
    const [event] = await query<{ id: string }>(
      "select id from events where published order by slug limit 1"
    )
    await loginAsEditor(page)
    await page.goto(`/fr/admin/events/${event.id}/edit`)
    const draftKey = `pel-admin-draft:event:${event.id}`
    try {
      await describeCoverIfMissing(page)
      const field = page.getByLabel("Histoire du lieu")
      await field.fill("javascript:alert(1)")
      await page.getByRole("button", { name: "Mettre à jour" }).first().click()
      await expect(page.locator("#historyUrl-error")).toHaveText(/adresse web/, {
        timeout: 15_000,
      })
      await expect(field).toHaveAttribute("aria-invalid", "true")
      await expect(page).toHaveURL(/\/edit$/)
    } finally {
      await page.evaluate((key) => localStorage.removeItem(key), draftKey)
    }
  })
})
