import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

const THEME = { name: "Patrimoine industriel e2e", slug: "patrimoine-industriel-e2e" }
const EVENT = { title: "Visite guidée du Moulin d'Andé", slug: "visite-guidee-moulin-ande" }

const deleteThemeIfPresent = async (page: Page) => {
  await page.goto("/fr/admin/themes")
  // count() does not wait: behind the admin loading boundary the list may not be there yet,
  // and a skipped delete left the theme on the event page.
  await expect(page.getByRole("heading", { level: 1, name: "Thématiques" })).toBeVisible()
  const remove = page.getByRole("button", { name: `Supprimer ${THEME.name}` })
  if ((await remove.count()) === 0) return
  const dialog = page.getByRole("alertdialog")
  // The trigger may be clicked before hydration on a cold dev server.
  await expect(async () => {
    await remove.click()
    await expect(dialog).toBeVisible({ timeout: 2_000 })
  }).toPass({ timeout: 30_000 })
  await dialog.getByRole("button", { name: "Supprimer" }).click()
  await expect(page.getByText("Thématique supprimée. Les événements sont conservés.")).toBeVisible()
}

test.describe("Themes", () => {
  test("the Millennium theme has its own home section in each language", async ({ page }) => {
    await page.goto("/fr")
    const section = page.getByRole("region", { name: "Millénaire de Guillaume le Conquérant" })
    await expect(section).toBeVisible()
    await expect(section.locator('img[src="/themes/millennium-marker.svg"]')).toBeVisible()

    await page.goto("/en")
    await expect(
      page.getByRole("region", { name: "William the Conqueror Millennium" })
    ).toBeVisible()
  })

  test.describe("managed by an editor", () => {
    test.skip(!editorCredentials(), MISSING_EDITOR)

    test("an editor creates a theme and tags an event; visitors filter on it", async ({ page }) => {
      test.setTimeout(150_000)
      await loginAsEditor(page)
      await deleteThemeIfPresent(page)

      try {
        await page.goto("/fr/admin/themes/new")
        await page.getByLabel("Nom *").fill(THEME.name)
        await expect(page.getByLabel(/^Slug/)).toHaveValue(THEME.slug)
        await page.getByRole("button", { name: "Créer la thématique" }).click()
        await expect(page).toHaveURL(/\/admin\/themes$/, { timeout: 15_000 })
        await expect(page.getByText(THEME.name)).toBeVisible()

        await page.goto("/fr/admin/events?search=Moulin")
        await page.getByRole("link", { name: `Modifier ${EVENT.title}` }).click()
        await expect(page).toHaveURL(/\/edit/, { timeout: 15_000 })
        await page.getByRole("checkbox", { name: THEME.name }).check()
        await page.getByRole("button", { name: "Mettre à jour" }).first().click()
        await expect(page).toHaveURL(/\/admin\/events(\?|$)/, { timeout: 15_000 })

        await page.goto("/fr/admin/themes")
        await expect(page.getByRole("listitem").filter({ hasText: THEME.name })).toContainText(
          "1 événement"
        )

        await page.goto("/fr/evenements")
        const chip = page.getByRole("group", { name: "Thématiques" }).getByRole("button", {
          name: new RegExp(THEME.name),
        })
        await chip.click()
        await expect(page).toHaveURL(new RegExp(`theme=${THEME.slug}`))
        await expect(chip).toHaveAttribute("aria-pressed", "true")
        await expect(page.getByRole("heading", { level: 3 })).toHaveText([EVENT.title])

        await page.goto(`/fr/evenement/${EVENT.slug}`)
        await expect(page.getByRole("link", { name: THEME.name })).toHaveAttribute(
          "href",
          `/fr/evenements?theme=${THEME.slug}`
        )
      } finally {
        await deleteThemeIfPresent(page)
      }

      // Deleting the theme keeps the event online.
      const response = await page.goto(`/fr/evenement/${EVENT.slug}`)
      expect(response?.status()).toBe(200)
      await expect(page.getByRole("link", { name: THEME.name })).toHaveCount(0)
    })
  })
})
