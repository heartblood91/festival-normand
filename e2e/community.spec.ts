import AxeBuilder from "@axe-core/playwright"
import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

const EVENT = "/fr/evenement/exposition-lumieres-bessin"
const TITLE = "Exposition 'Lumières sur le Bessin'"

const blockingViolations = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()
  ).violations
    .filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))
    .map((violation) => `${violation.id}: ${violation.nodes[0]?.target}`)

test.describe("Social pages and partner associations", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)

  test("an editor adds them and visitors see them on the site page", async ({ page, browser }) => {
    test.setTimeout(120_000)
    const association = `Amis du Bessin e2e ${Date.now()}`

    await loginAsEditor(page)
    await page.goto(`/fr/admin/events?search=${encodeURIComponent("Lumières sur le Bessin")}`)
    await page
      .getByRole("link", { name: `Modifier ${TITLE}` })
      .first()
      .click()
    await page.waitForURL(/\/admin\/events\/[^/]+\/edit$/)
    const editUrl = page.url()

    // A separate context: axe cannot analyze pages opened with browser.newPage().
    const visitorContext = await browser.newContext()
    const visitor = await visitorContext.newPage()
    let added = false
    try {
      const social = page.getByRole("region", { name: "Réseaux sociaux" })
      await social
        .getByLabel("Lien de réseau social 1")
        .fill("https://www.facebook.com/bessin.e2e/")
      await social.getByRole("button", { name: "Enregistrer les réseaux" }).click()
      await expect(page.getByText("Réseaux sociaux enregistrés.")).toBeVisible()

      const form = page.getByRole("form", { name: "Ajouter une association" })
      await form.getByLabel("Nom de l'association").fill(association)
      await form.getByLabel("Lien (facultatif)").fill("https://example.org/amis")
      await form.getByRole("button", { name: "Ajouter l'association" }).click()
      await expect(page.getByText("Association ajoutée.")).toBeVisible()
      added = true
      expect(await blockingViolations(page)).toEqual([])

      await visitor.goto(EVENT)
      await expect(
        visitor.getByRole("link", { name: /^Facebook de .+ \(nouvel onglet\)$/ })
      ).toHaveAttribute("href", "https://facebook.com/bessin.e2e")
      await expect(visitor.getByRole("link", { name: new RegExp(association) })).toHaveAttribute(
        "href",
        "https://example.org/amis"
      )
      expect(await blockingViolations(visitor)).toEqual([])
    } finally {
      await page.goto(editUrl)
      if (added) {
        await page.getByRole("button", { name: `Retirer : ${association}` }).click()
        await page.getByRole("alertdialog").getByRole("button", { name: "Retirer" }).click()
        await expect(page.getByText("Association retirée.")).toBeVisible()
      }
      const social = page.getByRole("region", { name: "Réseaux sociaux" })
      await social.getByRole("button", { name: "Retirer le lien 1" }).click()
      await social.getByRole("button", { name: "Enregistrer les réseaux" }).click()
      await expect(page.getByText("Réseaux sociaux enregistrés.")).toBeVisible()
      await visitor.goto(EVENT)
      await expect(visitor.getByRole("heading", { name: /Suivre le site/ })).toHaveCount(0)
      await visitorContext.close()
    }
  })
})
