import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

const MILLENNIUM = "Millénaire de Guillaume le Conquérant"
// Sorts before the Millennium theme, so its skin wins while it is shown.
const THEME = { name: "Atelier habillage e2e", slug: "atelier-habillage-e2e" }

const ribbonLink = (page: Page) =>
  page
    .getByRole("complementary", { name: MILLENNIUM })
    .getByRole("link", { name: "Les événements du millénaire" })

const themeRow = (page: Page) => page.getByRole("listitem").filter({ hasText: THEME.name })

const deleteThemeIfPresent = async (page: Page) => {
  await page.goto("/fr/admin/themes")
  await expect(page.getByRole("heading", { level: 1, name: "Thématiques" })).toBeVisible()
  const remove = page.getByRole("button", { name: `Supprimer ${THEME.name}` })
  if ((await remove.count()) === 0) return
  const dialog = page.getByRole("alertdialog")
  await expect(async () => {
    await remove.click()
    await expect(dialog).toBeVisible({ timeout: 2_000 })
  }).toPass({ timeout: 30_000 })
  await dialog.getByRole("button", { name: "Supprimer" }).click()
  await expect(page.getByText("Thématique supprimée. Les événements sont conservés.")).toBeVisible()
}

// The editor test changes which theme dresses the site: keep both tests in order.
test.describe.configure({ mode: "serial" })

test.describe("Millennium skin", () => {
  test("dresses the 2027 site with a ribbon and embroidered friezes", async ({ page }) => {
    await page.goto("/fr")
    await expect(page.locator('[data-skin="millennium"]')).toBeVisible()
    await expect(ribbonLink(page)).toHaveAttribute("href", "/fr/evenements?theme=millennium")
    await expect(page.locator('[aria-hidden="true"] pattern[id^="millennium-frieze"]')).toHaveCount(
      2
    )

    await page.goto("/en/contact")
    await expect(
      page.getByRole("complementary", { name: "Millennium of William the Conqueror" })
    ).toBeVisible()
  })

  test.describe("managed by an editor", () => {
    test.skip(!editorCredentials(), MISSING_EDITOR)

    test("a theme dresses the site only during its years", async ({ page }) => {
      test.setTimeout(150_000)
      await loginAsEditor(page)
      await deleteThemeIfPresent(page)

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
        await expect(ribbonLink(page)).toHaveAttribute("href", "/fr/evenements?theme=millennium")

        await page.goto("/fr/admin/themes")
        await page.getByRole("link", { name: `Modifier ${THEME.name}` }).click()
        await expect(page).toHaveURL(/\/edit/, { timeout: 15_000 })
        await expect(page.getByLabel("Années d'affichage")).toHaveValue("2026")
        await page.getByLabel("Années d'affichage").fill("2026, 2027")
        await page.getByRole("button", { name: "Mettre à jour" }).click()
        await expect(page).toHaveURL(/\/admin\/themes$/, { timeout: 15_000 })
        await expect(themeRow(page)).toContainText("2026, 2027")
        await page.goto("/fr")
        await expect(ribbonLink(page)).toHaveAttribute("href", `/fr/evenements?theme=${THEME.slug}`)
      } finally {
        await deleteThemeIfPresent(page)
      }

      await page.goto("/fr")
      await expect(ribbonLink(page)).toHaveAttribute("href", "/fr/evenements?theme=millennium")
    })
  })
})
