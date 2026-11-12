import AxeBuilder from "@axe-core/playwright"
import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

// A seed site whose first day is past, so reviews are open.
const EVENT = "/fr/evenement/exposition-lumieres-bessin"

const blockingViolations = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()
  ).violations
    .filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))
    .map((violation) => `${violation.id}: ${violation.nodes[0]?.target}`)

test.describe("Visitor reviews", () => {
  test("the form explains its errors and is accessible", async ({ page }) => {
    await page.goto(EVENT)
    const form = page.getByRole("form", { name: "Donner mon avis" })
    await expect(form).toBeVisible()
    expect(await blockingViolations(page)).toEqual([])

    await form.getByLabel("Votre avis").fill("Bof")
    await form.getByRole("button", { name: "Envoyer mon avis" }).click()
    await expect(form.getByRole("alert")).toContainText("Certains champs")
    await expect(form.getByRole("alert")).toBeFocused()
    await expect(form.getByLabel("Votre avis")).toHaveAttribute("aria-invalid", "true")
    await expect(form.getByText("Écrivez au moins 10 caractères.")).toBeVisible()
    await expect(form.getByLabel("Votre avis")).toHaveValue("Bof")
  })

  test.describe("moderated by an editor", () => {
    test.skip(!editorCredentials(), MISSING_EDITOR)

    test("a review appears only once an editor publishes it", async ({ page, browser }) => {
      test.setTimeout(120_000)
      const author = `Visiteur e2e ${Date.now()}`
      const comment = "Une soirée magique, les façades illuminées étaient superbes."

      const visitor = await browser.newPage()
      try {
        await visitor.goto(EVENT)
        const form = visitor.getByRole("form", { name: "Donner mon avis" })
        // The radio is visually hidden: pick the rating through its label, like a mouse user.
        await form.getByRole("radio", { name: "4 sur 5" }).locator("..").click()
        await expect(form.getByRole("radio", { name: "4 sur 5" })).toBeChecked()
        await form.getByLabel("Votre avis").fill(comment)
        await form.getByLabel("Prénom ou pseudonyme").fill(author)
        await form.getByRole("button", { name: "Envoyer mon avis" }).click()
        await expect(visitor.getByText("Merci pour votre avis !")).toBeFocused()

        await visitor.goto(EVENT)
        await expect(visitor.getByText(author)).toHaveCount(0)

        await loginAsEditor(page)
        await page.goto("/fr/admin/reviews")
        const card = page.getByRole("article", { name: `Avis de ${author}` })
        await expect(card).toContainText(comment)
        await expect(card).toContainText("4/5")
        expect(await blockingViolations(page)).toEqual([])
        await card.getByRole("button", { name: /^Publier/ }).click()
        await expect(card).toHaveCount(0)

        await expect(async () => {
          await visitor.goto(EVENT)
          await expect(visitor.getByText(author)).toBeVisible({ timeout: 2_000 })
        }).toPass({ timeout: 30_000 })
        await expect(
          visitor.getByRole("img", { name: /^Note moyenne : [\d,]+ sur 5$/ })
        ).toBeVisible()
      } finally {
        for (const tab of ["", "?statut=approved"]) {
          await page.goto(`/fr/admin/reviews${tab}`)
          const card = page.getByRole("article", { name: `Avis de ${author}` })
          if (await card.count()) {
            await card.getByRole("button", { name: /^Supprimer/ }).click()
            await page.getByRole("alertdialog").getByRole("button", { name: "Supprimer" }).click()
            await expect(card).toHaveCount(0)
          }
        }
        await visitor.close()
      }
    })
  })
})
