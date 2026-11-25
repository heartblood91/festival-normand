import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"
import { hasDatabase, query } from "./helpers/db"

const MILLENNIUM = "Millénaire de Guillaume le Conquérant"
// Sorts before the Millennium theme, so its skin wins while it is shown.
const THEME = { name: "Atelier habillage e2e", slug: "atelier-habillage-e2e" }
const EXAMPLE_LOGO = "/themes/millennium-emblem.svg"
const UPLOADED_LOGO = "/images/hero-poster.jpg"
const PNG_1PX = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
  "base64"
)

const ribbonLogo = (page: Page) =>
  page.getByRole("complementary", { name: MILLENNIUM }).locator("img").first()

const ribbonLink = (page: Page) =>
  page
    .getByRole("complementary", { name: MILLENNIUM })
    .getByRole("link", { name: "Les événements du millénaire" })

const themeRow = (page: Page) => page.getByRole("listitem").filter({ hasText: THEME.name })

const deleteThemeIfPresent = async (page: Page, name = THEME.name) => {
  await page.goto("/fr/admin/themes")
  await expect(page.getByRole("heading", { level: 1, name: "Thématiques" })).toBeVisible()
  const remove = page.getByRole("button", { name: `Supprimer ${name}` })
  if ((await remove.count()) === 0) return
  const dialog = page.getByRole("alertdialog")
  await expect(async () => {
    await remove.click()
    await expect(dialog).toBeVisible({ timeout: 2_000 })
  }).toPass({ timeout: 30_000 })
  await dialog.getByRole("button", { name: "Supprimer" }).click()
  await expect(page.getByText("Thématique supprimée. Les événements sont conservés.")).toBeVisible()
}

const CMS_THEME = { name: "Atelier bandeau e2e", slug: "atelier-bandeau-e2e" }
const RIBBON = { title: "Mille ans e2e", dates: "MXXVII", cta: "Découvrir le millénaire e2e" }
const comet = (page: Page) => page.locator("[data-millennium-comet]")

// The editor tests change which theme dresses the site: keep the tests in order.
test.describe.configure({ mode: "serial" })

test.describe("Millennium skin", () => {
  test("dresses the 2027 site with a ribbon and embroidered friezes", async ({ page }) => {
    await page.goto("/fr")
    await expect(page.locator('[data-skin="millennium"]')).toBeVisible()
    await expect(ribbonLink(page)).toHaveAttribute("href", "/fr/thematique/millennium")
    await expect(ribbonLogo(page)).toHaveAttribute("src", EXAMPLE_LOGO)
    await expect(page.locator('[aria-hidden="true"][data-millennium-frieze]')).toHaveCount(2)
    await expect
      .poll(() =>
        page
          .locator('[data-millennium-frieze="afterHeader"] img')
          .evaluate((img: HTMLImageElement) => img.naturalWidth)
      )
      .toBeGreaterThan(0)

    await page.goto("/en/contact")
    await expect(
      page.getByRole("complementary", { name: "Millennium of William the Conqueror" })
    ).toBeVisible()
  })

  test("typing 1066 outside a form field sends Halley's comet across the screen", async ({
    page,
  }) => {
    await page.goto("/fr/contact")
    await expect(page.locator('[data-millennium-frieze="afterHeader"]')).toBeVisible()
    const errors: string[] = []
    page.on("pageerror", (error) => errors.push(error.message))
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text())
    })

    // Typed in a form field, the code is just text.
    await page.getByRole("main").getByRole("textbox").first().focus()
    await page.keyboard.type("1066")
    await expect(comet(page)).toHaveCount(0)

    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await page.keyboard.type("1066")
    await expect(comet(page)).toHaveCount(1)
    await expect(comet(page)).toHaveAttribute("aria-hidden", "true")
    // One flight, then it is gone.
    await expect(comet(page)).toHaveCount(0, { timeout: 6_000 })
    expect(errors).toEqual([])
  })

  test("hovering a frieze reveals its Latin titulus", async ({ page }) => {
    await page.goto("/fr")
    const upper = page.locator('[data-millennium-frieze="afterHeader"]')
    const titulus = upper.locator(".millennium-titulus")
    await expect(titulus).toHaveText("ISTI · MIRANT · STELLA")
    await expect(titulus).toHaveCSS("opacity", "0")
    await upper.hover()
    await expect(titulus).toHaveCSS("opacity", "1")
    // No layout shift: the band keeps its height.
    expect((await upper.boundingBox())?.height).toBeGreaterThan(40)
  })

  test("with reduced motion, no easter egg moves", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" })
    await page.goto("/fr")
    const upper = page.locator('[data-millennium-frieze="afterHeader"]')
    await expect(upper).toBeVisible()
    await upper.hover()
    await expect(upper.locator(".millennium-titulus")).toBeHidden()
    await page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur())
    await page.keyboard.type("1066")
    await page.waitForTimeout(300)
    await expect(comet(page)).toHaveCount(0)
  })

  test.describe("managed by an editor", () => {
    test.skip(!editorCredentials(), MISSING_EDITOR)

    test("a theme dresses the site only during its years", async ({ page }) => {
      test.setTimeout(150_000)
      await loginAsEditor(page)
      await deleteThemeIfPresent(page)
      // Uploads are answered locally: nothing is written to Blob storage.
      await page.route("**/api/upload", (route) => route.fulfill({ json: { url: UPLOADED_LOGO } }))

      try {
        await page.goto("/fr/admin/themes/new")
        await page.getByLabel("Nom *").fill(THEME.name)
        const years = page.getByLabel("Années d'affichage")
        await years.fill("20x7")
        await page.getByLabel("Habillage du site").selectOption("millennium")
        await page.getByRole("button", { name: "Créer la thématique" }).click()
        await expect(page.getByText("Années attendues au format 2027, 2028")).toBeVisible()
        await expect(years).toHaveAttribute("aria-invalid", "true")

        // Outside the current edition: the theme and its skin stay off the site.
        await years.fill("2026")
        await page.getByRole("button", { name: "Créer la thématique" }).click()
        await expect(page).toHaveURL(/\/admin\/themes$/, { timeout: 15_000 })
        await expect(themeRow(page)).toContainText("2026")
        await expect(themeRow(page)).toContainText(`Habillage : ${MILLENNIUM}`)
        await page.goto("/fr")
        await expect(ribbonLink(page)).toHaveAttribute("href", "/fr/thematique/millennium")

        await page.goto("/fr/admin/themes")
        await page.getByRole("link", { name: `Modifier ${THEME.name}` }).click()
        await expect(page).toHaveURL(/\/edit/, { timeout: 15_000 })
        await expect(page.getByLabel("Années d'affichage")).toHaveValue("2026")
        await page.getByLabel("Années d'affichage").fill("2026, 2027")
        await page
          .getByRole("group", { name: "Logo de l'habillage" })
          .locator('input[type="file"]')
          .setInputFiles({ name: "logo.png", mimeType: "image/png", buffer: PNG_1PX })
        await expect(page.getByText("Image téléversée")).toBeVisible()
        await page.getByRole("button", { name: "Mettre à jour" }).click()
        await expect(page).toHaveURL(/\/admin\/themes$/, { timeout: 15_000 })
        await expect(themeRow(page)).toContainText("2026, 2027")
        await page.goto("/fr")
        await expect(ribbonLink(page)).toHaveAttribute("href", `/fr/thematique/${THEME.slug}`)
        await expect(ribbonLogo(page)).toHaveAttribute("src", UPLOADED_LOGO)
      } finally {
        await deleteThemeIfPresent(page)
      }

      await page.goto("/fr")
      await expect(ribbonLink(page)).toHaveAttribute("href", "/fr/thematique/millennium")
      await expect(ribbonLogo(page)).toHaveAttribute("src", EXAMPLE_LOGO)
    })

    test("the ribbon texts and the theme page come from the theme form", async ({ page }) => {
      test.skip(!hasDatabase(), "Needs DATABASE_URL to tag an event of the edition")
      test.setTimeout(180_000)
      await loginAsEditor(page)
      await deleteThemeIfPresent(page, CMS_THEME.name)
      await page.route("**/api/upload", (route) => route.fulfill({ json: { url: UPLOADED_LOGO } }))

      try {
        await page.goto("/fr/admin/themes/new")
        await page.getByLabel("Nom *").fill(CMS_THEME.name)
        await page.getByLabel("Présentation (accueil)").fill("Un fil rouge pour les tests.")
        await page.getByRole("checkbox", { name: /Section sur l'accueil/ }).check()
        await page.getByLabel("Années d'affichage").fill("2027")
        await page.getByLabel("Habillage du site").selectOption("millennium")
        await page.getByLabel("Titre (français)").fill(RIBBON.title)
        await page.getByLabel("Dates (français)").fill(RIBBON.dates)
        await page.getByLabel("Texte du lien (français)").fill(RIBBON.cta)
        await page.getByLabel("Texte du lien (anglais)").fill("Discover e2e")
        await page
          .getByRole("group", { name: "Image de couverture" })
          .locator('input[type="file"]')
          .setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: PNG_1PX })
        await expect(page.getByText("Image téléversée")).toBeVisible()
        await page.getByRole("button", { name: "Créer la thématique" }).click()
        await expect(page).toHaveURL(/\/admin\/themes$/, { timeout: 15_000 })

        // The ribbon shows the editor's texts; English falls back to the French title.
        await page.goto("/fr")
        const ribbon = page.getByRole("complementary", { name: RIBBON.title })
        await expect(ribbon).toContainText(RIBBON.dates)
        await expect(ribbon.getByRole("link", { name: RIBBON.cta })).toHaveAttribute(
          "href",
          `/fr/thematique/${CMS_THEME.slug}`
        )
        // No event yet: the theme has no home section at all.
        await expect(page.getByRole("region", { name: CMS_THEME.name })).toHaveCount(0)
        await page.goto("/en")
        await expect(
          page
            .getByRole("complementary", { name: RIBBON.title })
            .getByRole("link", { name: "Discover e2e" })
        ).toHaveAttribute("href", `/en/thematique/${CMS_THEME.slug}`)

        await page.goto(`/fr/thematique/${CMS_THEME.slug}`)
        await expect(page.getByRole("heading", { level: 1, name: CMS_THEME.name })).toBeVisible()
        await expect(page.getByText("Un fil rouge pour les tests.")).toBeVisible()
        await expect(page.locator(`img[src="${UPLOADED_LOGO}"][alt=""]`)).toHaveCount(1)
        await expect(page.getByRole("link", { name: "Parcourir le programme" })).toBeVisible()

        // Tag a public event of the edition, then save the theme to refresh the site.
        const [event] = await query<{ id: string; title_fr: string }>(
          `SELECT e.id, e.title_fr FROM events e
           WHERE e.published AND e.date_start >= '2027-01-01' AND e.date_start < '2028-01-01'
             AND (e.tourinsoft_id IS NULL OR e.department NOT IN (
               SELECT department FROM department_settings WHERE publish_from > now()))
           ORDER BY e.date_start, e.id LIMIT 1`
        )
        test.skip(!event, "No public event in the 2027 edition")
        const [theme] = await query<{ id: string }>("SELECT id FROM themes WHERE slug = $1", [
          CMS_THEME.slug,
        ])
        await query('INSERT INTO "_event_themes" ("A", "B") VALUES ($1, $2)', [event.id, theme.id])
        await page.goto("/fr/admin/themes")
        await page.getByRole("link", { name: `Modifier ${CMS_THEME.name}` }).click()
        await expect(page).toHaveURL(/\/edit/, { timeout: 15_000 })
        await expect(page.getByRole("link", { name: /Voir la page/ })).toHaveAttribute(
          "href",
          `/fr/thematique/${CMS_THEME.slug}`
        )
        await page.getByRole("button", { name: "Mettre à jour" }).click()
        await expect(page).toHaveURL(/\/admin\/themes$/, { timeout: 15_000 })

        await page.goto("/fr")
        const section = page.getByRole("region", { name: CMS_THEME.name })
        await expect(section).toBeVisible()
        await expect(section.getByRole("link", { name: "Voir les événements" })).toHaveAttribute(
          "href",
          `/fr/thematique/${CMS_THEME.slug}`
        )
        await page.goto(`/fr/thematique/${CMS_THEME.slug}`)
        await expect(page.getByRole("heading", { level: 3, name: event.title_fr })).toBeVisible()
      } finally {
        await deleteThemeIfPresent(page, CMS_THEME.name)
      }
    })
  })
})
