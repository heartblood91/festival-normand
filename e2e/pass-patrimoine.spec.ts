import { test, expect, type Page } from "@playwright/test"
import {
  describeCoverIfMissing,
  editorCredentials,
  loginAsEditor,
  MISSING_EDITOR,
} from "./helpers/admin"
import { hasDatabase, query } from "./helpers/db"

const PASS_URL = "https://www.pass-patrimoine.fr/fr/lieux-et-visites/chateau-de-canon"
const SETTINGS_URL = "/fr/admin/reglages"

type Settings = { passEnabled: boolean; bannerEnabled: boolean; pages: string[] }

const PAGE_LABELS: Record<string, string> = {
  home: "Accueil",
  programme: "Programme",
  event: "Fiches événement",
}

const setChecked = async (page: Page, label: string | RegExp, checked: boolean) =>
  page.getByLabel(label, { exact: typeof label === "string" }).setChecked(checked)

/** Saves through the admin form: the action is what expires the public cache. */
const saveSettings = async (page: Page, settings: Partial<Settings> = {}) => {
  await page.goto(SETTINGS_URL)
  if (settings.passEnabled !== undefined) {
    await setChecked(page, /Afficher le Pass Patrimoine sur les événements/, settings.passEnabled)
  }
  if (settings.bannerEnabled !== undefined) {
    await setChecked(page, /Afficher le bandeau/, settings.bannerEnabled)
  }
  for (const [value, label] of Object.entries(PAGE_LABELS)) {
    if (settings.pages) await setChecked(page, label, settings.pages.includes(value))
  }
  await page.getByRole("button", { name: "Enregistrer" }).click()
  await expect(page.getByText("Réglages du Pass Patrimoine enregistrés.")).toBeVisible({
    timeout: 15_000,
  })
}

const savePassUrl = async (page: Page, id: string, url: string) => {
  await page.goto(`/fr/admin/events/${id}/edit`)
  await describeCoverIfMissing(page)
  await page.getByLabel("Fiche du lieu sur pass-patrimoine.fr").fill(url)
  await page.getByRole("button", { name: "Mettre à jour" }).first().click()
  await expect(page).toHaveURL(/\/admin\/events$/, { timeout: 15_000 })
}

const banner = (page: Page) => page.getByRole("complementary", { name: "Pass Patrimoine" })

test.describe("Pass Patrimoine", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)
  test.skip(!hasDatabase(), "Needs DATABASE_URL to pick an event and restore the settings")
  test.describe.configure({ mode: "serial" })
  test.setTimeout(120_000)

  let event: { id: string; slug: string; title_fr: string }
  let savedSettings: { value: unknown } | undefined

  test.beforeAll(async () => {
    ;[event] = await query<typeof event>(
      `select id, slug, title_fr from events
       where published and pass_patrimoine_url is null order by slug limit 1`
    )
    ;[savedSettings] = await query<{ value: unknown }>(
      "select value from site_settings where key = 'pass-patrimoine'"
    )
  })

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage()
    await loginAsEditor(page)
    if (event) await savePassUrl(page, event.id, "")
    if (savedSettings) {
      await query("update site_settings set value = $1 where key = 'pass-patrimoine'", [
        JSON.stringify(savedSettings.value),
      ])
    } else {
      await query("delete from site_settings where key = 'pass-patrimoine'")
    }
    // Saving the restored values unchanged expires the cached public settings.
    await saveSettings(page)
    await page.close()
  })

  test.beforeEach(async ({ page }) => {
    test.skip(!event, "No published event without a Pass Patrimoine link")
    await loginAsEditor(page)
  })

  test("the master toggle shows and hides the event badge", async ({ page }) => {
    await savePassUrl(page, event.id, PASS_URL)

    await saveSettings(page, { passEnabled: true, bannerEnabled: false })
    await page.goto(`/fr/evenement/${event.slug}`)
    const callout = page.getByRole("region", { name: "Accessible avec le Pass Patrimoine" })
    await expect(callout).toBeVisible()
    const link = callout.getByRole("link", { name: /Voir la fiche du lieu/ })
    await expect(link).toHaveAttribute(
      "href",
      `${PASS_URL}?utm_source=pierres-en-lumieres&utm_medium=referral&utm_campaign=festival`
    )
    await expect(link).toHaveAttribute("target", "_blank")
    await expect(link).toHaveAttribute("rel", /noopener/)

    await page.goto(`/fr/evenements?edition=all&search=${encodeURIComponent(event.title_fr)}`)
    const card = page.locator(`a[href$="/evenement/${event.slug}"]`).first()
    await expect(card.getByTestId("pass-patrimoine-card-badge")).toBeVisible()
    await expect(page.getByRole("button", { name: /Sites du Pass Patrimoine/ })).toBeVisible()

    await saveSettings(page, { passEnabled: false })
    await page.goto(`/fr/evenement/${event.slug}`)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByTestId("pass-patrimoine-callout")).toHaveCount(0)
    await page.goto(`/fr/evenements?edition=all&search=${encodeURIComponent(event.title_fr)}`)
    await expect(page.locator(`a[href$="/evenement/${event.slug}"]`).first()).toBeVisible()
    await expect(page.getByTestId("pass-patrimoine-card-badge")).toHaveCount(0)
    await expect(page.getByRole("button", { name: /Sites du Pass Patrimoine/ })).toHaveCount(0)
  })

  test("the banner shows only when enabled, on the selected pages", async ({ page }) => {
    await saveSettings(page, { bannerEnabled: true, pages: ["programme"] })
    await page.goto("/fr/evenements")
    await expect(banner(page)).toBeVisible()
    await expect(banner(page).getByRole("link", { name: /Découvrir le Pass/ })).toHaveAttribute(
      "href",
      /^https:\/\/www\.pass-patrimoine\.fr\/\?utm_source=pierres-en-lumieres/
    )
    await page.goto("/fr")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(banner(page)).toHaveCount(0)

    await saveSettings(page, { bannerEnabled: false })
    await page.goto("/fr/evenements")
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(banner(page)).toHaveCount(0)
  })

  test("a visitor can close the banner, and it stays closed", async ({ page }) => {
    await saveSettings(page, { bannerEnabled: true, pages: ["programme"] })
    await page.goto("/fr/evenements")
    const close = banner(page).getByRole("button", {
      name: "Masquer le bandeau du Pass Patrimoine",
    })
    await expect(close).toBeVisible()
    const box = await close.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(44)
    expect(box?.height).toBeGreaterThanOrEqual(44)
    await close.focus()
    await page.keyboard.press("Enter")
    await expect(banner(page)).toHaveCount(0)
    await expect(page.locator("#main-content")).toBeFocused()

    await page.reload()
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(banner(page)).toBeHidden()
    await page.evaluate(() => localStorage.clear())
  })

  test("a banner link outside pass-patrimoine.fr is refused", async ({ page }) => {
    await page.goto(SETTINGS_URL)
    await page.getByLabel(/Lien du bouton/).fill("https://example.com/pass")
    await page.getByRole("button", { name: "Enregistrer" }).click()
    await expect(page.locator("#bannerUrl-error")).toHaveText(
      "Le lien doit être une page https du site pass-patrimoine.fr"
    )
  })
})
