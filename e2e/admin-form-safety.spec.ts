import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

const NEW_EVENT_DRAFT = "pel-admin-draft:event:new"

const parisToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date())

/** Accepts reloads, records and refuses in-app "leave the page?" confirms. */
const recordLeaveConfirms = (page: Page) => {
  const messages: string[] = []
  page.on("dialog", async (dialog) => {
    if (dialog.type() === "beforeunload") return dialog.accept()
    messages.push(dialog.message())
    await dialog.dismiss()
  })
  return messages
}

test.describe("Admin forms keep unsaved work", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)

  test.beforeEach(async ({ page }) => {
    await loginAsEditor(page)
    await page.evaluate((key) => localStorage.removeItem(key), NEW_EVENT_DRAFT)
  })

  test.afterEach(async ({ page }) => {
    await page.evaluate((key) => localStorage.removeItem(key), NEW_EVENT_DRAFT)
  })

  test("leaving with unsaved edits asks first, and a reload offers the draft", async ({ page }) => {
    const confirms = recordLeaveConfirms(page)
    await page.goto("/fr/admin/events/new")
    await page.getByLabel("Titre *").fill("Veillée e2e brouillon")
    await expect(page.getByText("Modifications non enregistrées")).toBeVisible()

    await page.getByRole("link", { name: "Retour à la liste" }).click()
    await expect.poll(() => confirms.length).toBe(1)
    expect(confirms[0]).toContain("modifications ne sont pas enregistrées")
    await expect(page).toHaveURL(/\/admin\/events\/new/)

    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), NEW_EVENT_DRAFT))
      .toContain("Veillée e2e brouillon")
    await page.reload()

    const banner = page.getByRole("region", { name: "Brouillon non enregistré" })
    await expect(banner).toBeVisible()
    await banner.getByRole("button", { name: "Restaurer le brouillon" }).click()
    await expect(banner).toBeHidden()
    await expect(page.getByLabel("Titre *")).toHaveValue("Veillée e2e brouillon")
  })

  test("an ignored draft is forgotten", async ({ page }) => {
    await page.goto("/fr/admin/events/new")
    await page.evaluate(
      (key) =>
        localStorage.setItem(
          key,
          JSON.stringify({ savedAt: Date.now(), values: { titleFr: "Ancien brouillon" } })
        ),
      NEW_EVENT_DRAFT
    )
    await page.reload()
    await page.getByRole("button", { name: "Ignorer" }).click()
    await expect(page.getByRole("region", { name: "Brouillon non enregistré" })).toHaveCount(0)
    await expect(page.getByLabel("Titre *")).toHaveValue("")
    expect(await page.evaluate((key) => localStorage.getItem(key), NEW_EVENT_DRAFT)).toBeNull()
  })

  test("language tabs follow the ARIA pattern and flag missing translations", async ({ page }) => {
    await page.goto("/fr/admin/events/new")
    const tablist = page.getByRole("tablist", { name: "Langue du contenu" })
    const fr = tablist.getByRole("tab", { name: /^FR/ })
    const en = tablist.getByRole("tab", { name: /^EN/ })
    await expect(fr).toHaveAttribute("aria-selected", "true")
    await expect(en).toHaveAttribute("tabindex", "-1")

    await page.getByLabel("Titre *").fill("Concert aux chandelles")
    await expect(en).toHaveAccessibleName("EN (à compléter)")

    await fr.focus()
    await page.keyboard.press("ArrowRight")
    await expect(en).toHaveAttribute("aria-selected", "true")
    await expect(en).toBeFocused()
    await expect(page.getByRole("tabpanel").first()).toHaveAttribute(
      "aria-labelledby",
      "locale-tab-en"
    )
    await page.getByLabel("Title", { exact: true }).fill("Candlelight concert")
    await expect(en).toHaveAccessibleName("EN")
  })

  test("dates default to the festival's calendar and the end cannot precede the start", async ({
    page,
  }) => {
    await page.goto("/fr/admin/events/new")
    const start = page.getByLabel("Date de début *")
    await expect(start).toHaveValue(/^\d{4}-\d{2}-\d{2}$/)
    await expect(page.getByLabel("Date de fin")).toHaveAttribute("min", await start.inputValue())
    // Typed like a user (headless Chromium keeps the mm/dd/yyyy order whatever the
    // locale): fill() on a date input does not reach React's onChange.
    // Retried: on a production build, keys typed before hydration are reset.
    await expect(async () => {
      await start.focus()
      await page.keyboard.type("05222027")
      await expect(start).toHaveValue("2027-05-22", { timeout: 2_000 })
    }).toPass({ timeout: 15_000 })
    await expect(page.getByLabel("Date de fin")).toHaveAttribute("min", "2027-05-22")

    await page.goto("/fr/admin/news/new")
    await expect(page.getByLabel("Date de publication *")).toHaveValue(parisToday())
    await page.evaluate(() => localStorage.removeItem("pel-admin-draft:news:new"))
  })
})
