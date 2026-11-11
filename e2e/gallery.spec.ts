import AxeBuilder from "@axe-core/playwright"
import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

// A year no real edition uses, so the test never mixes with editorial photos.
const YEAR = "2001"
const ALT = "Façade e2e illuminée de bleu"
const LOCAL_IMAGE = "/images/hero-poster.jpg"
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
)

const blockingViolations = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()
  ).violations
    .filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))
    .map((violation) => `${violation.id}: ${violation.nodes[0]?.target}`)

const yearSection = (page: Page) =>
  page.getByRole("region", { name: new RegExp(`Édition ${YEAR}`) })

const deleteTestPhotos = async (page: Page) => {
  await page.goto("/fr/admin/gallery")
  await expect(page.getByRole("heading", { level: 1, name: "Retour en images" })).toBeVisible()
  const remove = yearSection(page).getByRole("button", { name: /^Supprimer/ })
  let count = await remove.count()
  while (count > 0) {
    const dialog = page.getByRole("alertdialog")
    await expect(async () => {
      await remove.first().click()
      await expect(dialog).toBeVisible({ timeout: 2_000 })
    }).toPass({ timeout: 30_000 })
    await dialog.getByRole("button", { name: "Supprimer" }).click()
    count -= 1
    await expect(remove).toHaveCount(count)
  }
}

test.describe("Photo gallery", () => {
  test("a year without photos is a 404", async ({ request }) => {
    expect((await request.get("/fr/retour-en-images/1999")).status()).toBe(404)
    expect((await request.get("/fr/retour-en-images/2026/extra")).status()).toBe(404)
  })

  test.describe("managed by an editor", () => {
    test.skip(!editorCredentials(), MISSING_EDITOR)

    test("a photo goes online only with its text alternative, then opens in a dialog", async ({
      page,
      browser,
    }) => {
      test.setTimeout(150_000)
      await loginAsEditor(page)
      await deleteTestPhotos(page)
      // Nothing is written to storage: the upload answers with a site asset.
      await page.route("**/api/upload", (route) => route.fulfill({ json: { url: LOCAL_IMAGE } }))

      try {
        await page.getByLabel("Édition").first().fill(YEAR)
        await page
          .locator("#gallery-files")
          .setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: PNG_1PX })
        await expect(page.getByText(/1 photo ajoutée/)).toBeVisible()

        const card = yearSection(page).getByRole("form", { name: `Photo 1 de ${YEAR}` })
        await expect(yearSection(page).getByText("Texte alternatif manquant")).toBeVisible()

        const visitor = await browser.newContext({ baseURL: test.info().project.use.baseURL })
        const visit = await visitor.newPage()
        // A draft photo keeps the year hidden.
        expect((await visit.request.get(`/fr/retour-en-images/${YEAR}`)).status()).toBe(404)

        await card.getByLabel("Texte alternatif *").fill(ALT)
        await card.getByLabel("Crédit photo").fill("E2E Studio")
        await card.getByRole("button", { name: "Enregistrer" }).click()
        await expect(page.getByText("Photo enregistrée.")).toBeVisible()
        await expect(yearSection(page).getByText("En ligne")).toBeVisible()

        await expect(async () => {
          const response = await visit.goto(`/fr/retour-en-images/${YEAR}`)
          expect(response?.status()).toBe(200)
        }).toPass({ timeout: 30_000 })
        await expect(visit.getByRole("heading", { level: 2, name: new RegExp(YEAR) })).toBeVisible()

        const open = visit.getByRole("button", { name: `Agrandir : ${ALT}` })
        await open.click()
        const dialog = visit.getByRole("dialog", { name: "Photo agrandie" })
        await expect(dialog).toBeVisible()
        await expect(dialog.getByRole("img", { name: ALT })).toBeVisible()
        await expect(dialog.getByText("© E2E Studio")).toBeVisible()
        await expect(dialog.getByRole("button", { name: "Fermer" })).toBeFocused()
        await visit.keyboard.press("Escape")
        await expect(dialog).toBeHidden()
        await expect(open).toBeFocused()

        expect(await blockingViolations(visit)).toEqual([])
        await visitor.close()
      } finally {
        await deleteTestPhotos(page)
      }
    })
  })
})
