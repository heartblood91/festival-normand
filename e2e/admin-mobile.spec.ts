import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

const ADMIN_PAGES = [
  "/fr/admin",
  "/fr/admin/events",
  "/fr/admin/events/new",
  "/fr/admin/news",
  "/fr/admin/news/new",
  "/fr/admin/partners",
  "/fr/admin/partners/new",
  "/fr/admin/themes",
  "/fr/admin/themes/new",
  "/fr/admin/surveys",
  "/fr/admin/surveys/new",
  "/fr/admin/gallery",
  "/fr/admin/pages",
  "/fr/admin/settings",
  "/fr/admin/edition",
  "/fr/admin/inscription",
]

/** Page-level and scroll-container overflow, in pixels. */
const horizontalOverflow = (page: Page) =>
  page.evaluate(() => {
    const main = document.querySelector("main")
    return Math.max(
      document.documentElement.scrollWidth - window.innerWidth,
      main ? main.scrollWidth - main.clientWidth : 0
    )
  })

test.describe("Admin on a 390px phone", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)
  test.use({ viewport: { width: 390, height: 844 } })

  test.beforeEach(async ({ page }) => {
    await loginAsEditor(page)
  })

  test("no admin page scrolls sideways", async ({ page }) => {
    test.setTimeout(120_000)
    for (const path of ADMIN_PAGES) {
      await page.goto(path)
      await page.waitForLoadState("networkidle")
      expect(await horizontalOverflow(page), path).toBeLessThanOrEqual(0)
    }
  })

  test("the menu navigates client-side and closes", async ({ page }) => {
    await page.goto("/fr/admin")
    await page.evaluate(() => Object.assign(window, { __noReload: true }))

    await page.getByRole("button", { name: "Ouvrir le menu" }).click()
    const drawer = page.getByRole("dialog")
    await expect(drawer.getByRole("link", { name: "Paramètres" })).toBeVisible()
    await drawer.getByRole("link", { name: "Actualités" }).click()

    await expect(page).toHaveURL(/\/fr\/admin\/news$/)
    await expect(drawer).toBeHidden()
    expect(await page.evaluate(() => "__noReload" in window)).toBe(true)

    await page.getByRole("button", { name: "Ouvrir le menu" }).click()
    await page.getByRole("button", { name: "Fermer le menu" }).click()
    await expect(page.getByRole("dialog")).toBeHidden()
  })

  for (const list of ["events", "news"]) {
    test(`each ${list} row says its status in words`, async ({ page }) => {
      // Design audit #21: below md the status was an eye icon only.
      await page.goto(`/fr/admin/${list}`)
      const rows = page.locator("tbody tr")
      expect(await rows.count()).toBeGreaterThan(0)
      for (const row of await rows.all()) {
        // sr-only text has a 1px box: Playwright would call it visible.
        const status = row.getByText(/^(Publié|Dépublié|Brouillon)$/).filter({ visible: true })
        expect((await status.boundingBox())?.width ?? 0).toBeGreaterThan(20)
      }
    })
  }

  test("the fixed action bar never covers the last field", async ({ page }) => {
    // Design audit #18.
    await page.goto("/fr/admin/events/new")
    await page.waitForLoadState("networkidle")
    const bar = page.getByRole("button", { name: "Créer l'événement" }).locator("xpath=..")
    await page.evaluate(() => {
      const main = document.querySelector("main")
      main?.scrollTo(0, main.scrollHeight)
      window.scrollTo(0, document.body.scrollHeight)
    })
    const barTop = (await bar.boundingBox())!.y
    const lastFieldBottom = await page.evaluate(() => {
      const fields = [...document.querySelectorAll("main form :is(input, textarea, select)")]
        .filter((field) => (field as HTMLInputElement).type !== "hidden")
        .map((field) => field.getBoundingClientRect())
        .filter((rect) => rect.height > 0)
      return Math.max(...fields.map((rect) => rect.bottom))
    })
    expect(lastFieldBottom).toBeLessThanOrEqual(barTop)
  })

  test("save and publish stay at the bottom of the screen", async ({ page }) => {
    await page.goto("/fr/admin/events/new")
    const save = page.getByRole("button", { name: "Créer l'événement" })
    await expect(save).toBeVisible()
    const box = await save.boundingBox()
    expect(box!.y + box!.height).toBeGreaterThan(844 - 80)

    await page.mouse.move(195, 400)
    await page.mouse.wheel(0, 2000)
    await expect(save).toBeInViewport()
  })
})
