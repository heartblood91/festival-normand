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
  test("the Millennium theme has its own page and a home section only with events", async ({
    page,
  }) => {
    const response = await page.goto("/fr/thematique/millennium")
    expect(response?.status()).toBe(200)
    await expect(
      page.getByRole("heading", { level: 1, name: "Millénaire de Guillaume le Conquérant" })
    ).toBeVisible()
    const events = await page.getByRole("main").getByRole("heading", { level: 3 }).count()

    // Never an empty block: the home section exists only when the page lists events.
    await page.goto("/fr")
    const section = page.getByRole("region", { name: "Millénaire de Guillaume le Conquérant" })
    if (events > 0) {
      await expect(section).toBeVisible()
      await expect(section.locator('img[src="/themes/millennium-marker.svg"]')).toBeVisible()
      await expect(section.getByRole("link", { name: "Voir les événements" })).toHaveAttribute(
        "href",
        "/fr/thematique/millennium"
      )
    } else {
      await expect(section).toHaveCount(0)
      await expect(page.getByText("Les lieux participants seront annoncés")).toHaveCount(0)
    }

    await page.goto("/en/thematique/millennium")
    await expect(
      page.getByRole("heading", { level: 1, name: "William the Conqueror Millennium" })
    ).toBeVisible()
    await expect(page.locator('link[rel="alternate"][hreflang="fr"]')).toHaveAttribute(
      "href",
      /\/fr\/thematique\/millennium$/
    )
  })

  test("a theme outside the current edition has no page", async ({ page }) => {
    const response = await page.goto("/fr/thematique/theme-inexistant-e2e")
    expect(response?.status()).toBe(404)
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

        await page.goto("/fr/evenements?edition=all")
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
