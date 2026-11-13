import { test, expect } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"
import { hasDatabase, query } from "./helpers/db"

type SourceRow = {
  id: string
  source_title_fr: string | null
  source_description_fr: string | null
  texts_corrected_at: Date | null
}

test.describe("AI proofreading of imported texts", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)
  test.skip(!hasDatabase(), "Needs DATABASE_URL to set an imported source text")

  test.beforeEach(async ({ page }) => {
    await loginAsEditor(page)
  })

  test("the dashboard counts the imported events left to proofread", async ({ page }) => {
    const [{ count }] = await query<{ count: string }>(
      "SELECT count(*) FROM events WHERE tourinsoft_id IS NOT NULL AND texts_corrected_at IS NULL"
    )
    test.skip(Number(count) === 0, "Every imported event is already proofread")

    await page.goto("/fr/admin")
    const card = page.getByRole("region", { name: "Correction des textes importés" })
    await expect(card).toContainText(`${count} fiche`)
    if (!process.env.OPENROUTER_API_KEY) {
      await expect(card).toContainText("Ajoutez la clé OpenRouter")
      await expect(card.getByRole("button")).toHaveCount(0)
    }
  })

  test("an imported event shows the text it was received with", async ({ page }) => {
    // Stay clear of the rows other admin specs edit in parallel.
    const [event] = await query<SourceRow>(
      `SELECT id, source_title_fr, source_description_fr, texts_corrected_at FROM events
       WHERE tourinsoft_id IS NOT NULL ORDER BY slug OFFSET 3 LIMIT 1`
    )
    try {
      await query(
        `UPDATE events SET source_title_fr = $2, source_description_fr = $3,
         texts_corrected_at = $4 WHERE id = $1`,
        [event.id, "VISITE DU CHATEAU", "texte recu tel quel", new Date("2026-11-12T08:00:00Z")]
      )
      await page.goto(`/fr/admin/events/${event.id}/edit`)
      const banner = page.getByRole("region", { name: "Fiche synchronisée depuis Tourinsoft" })
      await banner.getByText("Texte d'origine importé").click()
      await expect(banner).toContainText("relus par l'IA le 12 novembre 2026")
      await expect(banner).toContainText("VISITE DU CHATEAU")
      await expect(banner).toContainText("texte recu tel quel")
    } finally {
      await query(
        `UPDATE events SET source_title_fr = $2, source_description_fr = $3,
         texts_corrected_at = $4 WHERE id = $1`,
        [event.id, event.source_title_fr, event.source_description_fr, event.texts_corrected_at]
      )
    }
  })
})
