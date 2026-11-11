import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

const NEW_EVENT_DRAFT = "pel-admin-draft:event:new"
const LOCAL_IMAGE = "/images/hero-poster.jpg"
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
)

/** Answers uploads locally: nothing is ever written to Blob storage. */
const fakeUploads = (page: Page) =>
  page.route("**/api/upload", (route) => route.fulfill({ json: { url: LOCAL_IMAGE } }))

const uploadIn = async (scope: ReturnType<Page["getByRole"]> | Page) => {
  await scope
    .locator('input[type="file"]')
    .first()
    .setInputFiles({ name: "photo.png", mimeType: "image/png", buffer: PNG_1PX })
}

test.describe("Admin images and links", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)

  test.beforeEach(async ({ page }) => {
    await loginAsEditor(page)
    await fakeUploads(page)
    // Any native prompt/confirm means a window.prompt survived.
    page.on("dialog", (dialog) => {
      throw new Error(`Unexpected native dialog: ${dialog.message()}`)
    })
  })

  test.afterEach(async ({ page }) => {
    await page.evaluate((key) => localStorage.removeItem(key), NEW_EVENT_DRAFT)
  })

  test("an editor image is inserted only with an alt text", async ({ page }) => {
    await page.goto("/fr/admin/events/new")
    await page.getByRole("button", { name: "Insérer une image" }).first().click()
    const dialog = page.getByRole("dialog", { name: "Insérer une image" })
    await uploadIn(dialog)

    const insert = dialog.getByRole("button", { name: "Insérer", exact: true })
    await expect(dialog.getByLabel("Texte alternatif *")).toBeVisible()
    await expect(insert).toBeDisabled()
    await dialog.getByLabel("Texte alternatif *").fill("Nef éclairée à la bougie")
    await insert.click()

    await expect(
      page.locator('.ProseMirror img[alt="Nef éclairée à la bougie"]').first()
    ).toBeVisible()
    await expect(page.getByText(/sans texte alternatif \(cadre pointillé\)/)).toHaveCount(0)
  })

  test("the link dialog refuses unsafe addresses and adds https", async ({ page }) => {
    await page.goto("/fr/admin/events/new")
    const editor = page.locator(".ProseMirror").first()
    await editor.click()
    await page.keyboard.type("Programme complet")
    await page.keyboard.press("ControlOrMeta+A")
    await page.getByRole("button", { name: "Lien", exact: true }).first().click()

    const dialog = page.getByRole("dialog", { name: "Ajouter un lien" })
    const address = dialog.getByLabel("Adresse du lien")
    await address.fill("javascript:alert(1)")
    await address.press("Enter")
    await expect(dialog.getByText(/Adresse invalide/)).toBeVisible()
    await expect(editor.locator("a")).toHaveCount(0)

    await address.fill("pierresenlumieres.fr/programme")
    await dialog.getByRole("button", { name: "Ajouter le lien" }).click()
    await expect(dialog).toBeHidden()
    await expect(editor.locator("a")).toHaveAttribute(
      "href",
      "https://pierresenlumieres.fr/programme"
    )
  })

  test("a published event cannot be saved with a cover lacking alt", async ({ page }) => {
    await page.goto("/fr/admin/events?status=published")
    await page
      .getByRole("link", { name: /^Modifier / })
      .first()
      .click()
    await expect(page).toHaveURL(/\/admin\/events\/[^/]+\/edit/, { timeout: 15_000 })
    const editUrl = page.url()
    const draftKey = `pel-admin-draft:event:${editUrl.split("/").at(-2)}`

    try {
      const coverCard = page.locator("div", { has: page.getByText("Image de couverture") }).last()
      const remove = coverCard.getByRole("button", { name: "Retirer l'image" })
      if (await remove.count()) await remove.click()
      await uploadIn(coverCard)

      const alt = page.getByLabel("Texte alternatif (FR) *")
      await expect(alt).toHaveValue("")
      await page.getByRole("button", { name: "Mettre à jour" }).click()

      await expect(page.locator("#coverImageAltFr-error")).toHaveText(
        "Décrivez l'image de couverture (texte alternatif) avant de publier",
        { timeout: 15_000 }
      )
      await expect(alt).toHaveAttribute("aria-invalid", "true")
      await expect(page).toHaveURL(editUrl)
    } finally {
      await page.evaluate((key) => localStorage.removeItem(key), draftKey)
    }
  })

  test("the editor wraps text in a callout and switches its variant", async ({ page }) => {
    await page.goto("/fr/admin/events/new")
    const editor = page.locator(".ProseMirror").first()
    await editor.click()
    await page.keyboard.type("Réservation obligatoire")

    const info = page.getByRole("button", { name: "Encadré « À noter »" }).first()
    const important = page.getByRole("button", { name: "Encadré « Important »" }).first()
    await info.click()
    await expect(editor.locator('div[data-block="callout"][data-variant="info"] p')).toHaveText(
      "Réservation obligatoire"
    )
    await expect(info).toHaveAttribute("aria-pressed", "true")

    await important.click()
    await expect(editor.locator('div[data-block="callout"][data-variant="important"]')).toHaveCount(
      1
    )
    await expect(info).toHaveAttribute("aria-pressed", "false")

    await important.click()
    await expect(editor.locator('div[data-block="callout"]')).toHaveCount(0)
    await expect(editor.locator("p").first()).toHaveText("Réservation obligatoire")
  })

  test("the editor inserts and edits a call-to-action button", async ({ page }) => {
    await page.goto("/fr/admin/events/new")
    const editor = page.locator(".ProseMirror").first()
    await editor.click()
    await page.getByRole("button", { name: "Bouton d'action" }).first().click()

    const dialog = page.getByRole("dialog", { name: "Insérer un bouton" })
    await dialog.getByLabel("Adresse du bouton").fill("javascript:alert(1)")
    await dialog.getByRole("button", { name: "Insérer le bouton" }).click()
    await expect(dialog.getByText("Saisissez le texte du bouton.")).toBeVisible()
    await expect(dialog.getByText(/Adresse invalide/)).toBeVisible()
    await expect(dialog.getByLabel("Texte du bouton")).toHaveAttribute("aria-invalid", "true")

    await dialog.getByLabel("Texte du bouton").fill("S'inscrire")
    await dialog.getByLabel("Adresse du bouton").fill("forms.test/inscription")
    await dialog.getByLabel("Adresse du bouton").press("Enter")
    await expect(dialog).toBeHidden()
    const cta = editor.locator('p[data-block="cta"] a[data-block="cta-link"]')
    await expect(cta).toHaveText("S'inscrire")
    await expect(cta).toHaveAttribute("href", "https://forms.test/inscription")

    await editor.locator('p[data-block="cta"]').click()
    await page.getByRole("button", { name: "Modifier le bouton" }).first().click()
    const edit = page.getByRole("dialog", { name: "Modifier le bouton" })
    await expect(edit.getByLabel("Texte du bouton")).toHaveValue("S'inscrire")
    await edit.getByLabel("Texte du bouton").fill("Je m'inscris")
    await edit.getByRole("button", { name: "Mettre à jour" }).click()
    await expect(cta).toHaveText("Je m'inscris")
  })
})
