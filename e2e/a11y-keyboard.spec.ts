import { test, expect } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR, republishEvent } from "./helpers/admin"
import { gotoForKeyboard, tabTo } from "./helpers/keyboard"
import { smallTargets } from "./helpers/targets"

// RGAA 7.3 / 12.13: every flow works without a mouse. Touch targets: 44px on touch screens
// (WCAG 2.5.5), 24px with a mouse (WCAG 2.5.8).

const PUBLIC_PAGES = [
  "/fr",
  "/fr/evenements",
  "/fr/evenements?view=map",
  "/fr/evenement/illumination-abbaye-aux-hommes",
  "/fr/actualites",
  "/fr/actualite/accessibilite-festival-pour-tous",
  "/fr/carnet",
  "/fr/contact",
  "/fr/inscription",
  "/fr/festival",
  "/fr/accessibilite",
  "/en",
]

const ADMIN_PAGES = [
  "/fr/admin",
  "/fr/admin/events",
  "/fr/admin/events/new",
  "/fr/admin/news",
  "/fr/admin/settings",
]

test.describe("keyboard: visitor flows", () => {
  test("filter the programme, open an event and keep it in the carnet", async ({ page }) => {
    test.setTimeout(90_000)
    await gotoForKeyboard(page, "/fr/evenements?edition=all")
    const night = page.getByRole("button", { name: /^Sam 22/ })
    await tabTo(page, night)
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/date=/)
    await expect(night).toHaveAttribute("aria-pressed", "true")

    const card = page.locator('main a[href*="/evenement/"]').first()
    await tabTo(page, card)
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/\/fr\/evenement\//)
    await page.waitForLoadState("networkidle")

    const keep = page.getByRole("button", { name: /^(Ajouter au carnet|Dans mon carnet)$/ })
    await tabTo(page, keep)
    await page.keyboard.press("Enter")
    await expect(keep).toHaveAttribute("aria-pressed", "true")

    const carnet = page.getByRole("banner").getByRole("link", { name: /^Mon carnet de voyage/ })
    await expect(carnet).toHaveAccessibleName("Mon carnet de voyage, 1 lieu")
    await tabTo(page, carnet, { reverse: true })
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/\/fr\/carnet$/)
    await page.waitForLoadState("networkidle")

    await tabTo(page, page.getByRole("button", { name: "Partager le carnet" }))
    await page.keyboard.press("Enter")
    await expect(page.getByRole("textbox", { name: "Lien de partage" })).toHaveValue(
      /\/fr\/carnet\/[0-9a-f-]{36}$/
    )
    await tabTo(page, page.getByRole("link", { name: "Envoyer par e-mail" }))
  })

  test("reach a department registration form", async ({ page, context }) => {
    // The department forms are external: never load them from a test.
    await context.route(/^https?:\/\/(?!127\.0\.0\.1|localhost)/, (route) => route.abort())
    await gotoForKeyboard(page, "/fr/inscription")
    await tabTo(page, page.getByRole("link", { name: /Choisissez votre département/ }))
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/#/)
    const departments = page.getByRole("region", { name: "Choisissez votre département" })
    const first = departments.getByRole("link").first()
    await tabTo(page, first)
    const href = (await first.getAttribute("href")) ?? ""
    expect(href).toMatch(/^https:\/\//)
    const opened = context.waitForEvent("request", (request) => request.url() === href)
    const popup = page.waitForEvent("popup")
    await page.keyboard.press("Enter")
    await Promise.all([opened, popup])
  })

  test("the contact form is filled and sent from the keyboard", async ({ page }) => {
    await gotoForKeyboard(page, "/fr/contact")
    await tabTo(page, page.getByLabel(/Nom complet/))
    await page.keyboard.type("Jean Dupont")
    await page.keyboard.press("Tab")
    await page.keyboard.type(`clavier-${Date.now()}@example.fr`)
    await tabTo(page, page.getByLabel(/Département/))
    await page.keyboard.press("ArrowDown")
    await tabTo(page, page.getByLabel(/Message/))
    await page.keyboard.type("Bonjour, je navigue au clavier uniquement.")
    await tabTo(page, page.getByRole("button", { name: /Envoyer/ }))
    await page.keyboard.press("Enter")
    // Without a mailer the form answers with a direct email link.
    await expect(page.getByRole("alert").or(page.getByRole("status")).first()).toBeVisible({
      timeout: 10_000,
    })
  })
})

test.describe("keyboard: admin", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)

  test("an editor unpublishes then publishes an event without a mouse", async ({ page }) => {
    test.setTimeout(120_000)
    await loginAsEditor(page)
    await gotoForKeyboard(page, "/fr/admin/events?status=published")
    const edit = page.getByRole("link", { name: /^Modifier / }).last()
    await tabTo(page, edit, { max: 250 })
    await page.keyboard.press("Enter")
    await expect(page).toHaveURL(/\/admin\/events\/[^/]+\/edit/, { timeout: 15_000 })
    const editUrl = page.url()
    try {
      await page.waitForLoadState("networkidle")
      await tabTo(page, page.getByRole("button", { name: "Dépublier" }), { max: 250 })
      await page.keyboard.press("Enter")
      await expect(page).toHaveURL(/\/admin\/events(\?|$)/, { timeout: 15_000 })

      await gotoForKeyboard(page, editUrl)
      await expect(page.getByText("Brouillon", { exact: true })).toBeVisible()
      await tabTo(page, page.getByRole("button", { name: "Publier", exact: true }), { max: 250 })
      await page.keyboard.press("Enter")
      const wizard = page.getByRole("dialog")
      // Focus moves into the review and stays there.
      await expect(wizard.locator(":focus")).toHaveCount(1)
      await expect(wizard.getByRole("button", { name: "Suivant" })).toBeEnabled({
        timeout: 30_000,
      })
      await tabTo(page, wizard.getByRole("button", { name: "Confirmation" }))
      await page.keyboard.press("Enter")
      await tabTo(page, wizard.getByRole("button", { name: "Publier maintenant" }))
      await page.keyboard.press("Enter")
      await expect(page).toHaveURL(/\/admin\/events(\?|$)/, { timeout: 15_000 })
      await page.goto(editUrl)
      await expect(page.getByText("Publié", { exact: true })).toBeVisible()
    } finally {
      await republishEvent(page, editUrl)
    }
  })
})

test.describe("touch targets", () => {
  test.describe("on a touch screen", () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true })

    test("public controls are at least 44px", async ({ page }) => {
      test.setTimeout(180_000)
      const problems: string[] = []
      for (const path of PUBLIC_PAGES) {
        await page.goto(path, { waitUntil: "networkidle" })
        problems.push(...(await smallTargets(page, 44)).map((line) => `${path}: ${line}`))
      }
      expect(problems, problems.join("\n")).toEqual([])
    })

    test("admin controls are at least 44px", async ({ page }) => {
      test.skip(!editorCredentials(), MISSING_EDITOR)
      test.setTimeout(180_000)
      await loginAsEditor(page)
      const problems: string[] = []
      for (const path of ADMIN_PAGES) {
        await page.goto(path, { waitUntil: "networkidle" })
        problems.push(...(await smallTargets(page, 44)).map((line) => `${path}: ${line}`))
      }
      expect(problems, problems.join("\n")).toEqual([])
    })
    test("admin lists keep every action on screen", async ({ page }) => {
      test.skip(!editorCredentials(), MISSING_EDITOR)
      await loginAsEditor(page)
      for (const path of ["/fr/admin/events", "/fr/admin/news"]) {
        await page.goto(path)
        await page.locator("tbody tr").first().waitFor()
        const overflow = await page
          .locator("table")
          .evaluate((table) => table.scrollWidth - (table.parentElement?.clientWidth ?? 0))
        expect(overflow, path).toBeLessThanOrEqual(0)
      }
    })
  })

  test.describe("with a mouse", () => {
    test.use({ viewport: { width: 1440, height: 900 } })

    test("public and admin controls are at least 24px", async ({ page }) => {
      test.setTimeout(240_000)
      const problems: string[] = []
      for (const path of PUBLIC_PAGES) {
        await page.goto(path, { waitUntil: "networkidle" })
        problems.push(...(await smallTargets(page, 24)).map((line) => `${path}: ${line}`))
      }
      if (editorCredentials()) {
        await loginAsEditor(page)
        for (const path of ADMIN_PAGES) {
          await page.goto(path, { waitUntil: "networkidle" })
          problems.push(...(await smallTargets(page, 24)).map((line) => `${path}: ${line}`))
        }
      }
      expect(problems, problems.join("\n")).toEqual([])
    })
  })
})
