import AxeBuilder from "@axe-core/playwright"
import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

const SURVEY = { title: "Votre avis e2e", slug: "votre-avis-e2e" }

const blockingViolations = async (page: Page) =>
  (
    await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze()
  ).violations
    .filter((violation) => ["serious", "critical"].includes(violation.impact ?? ""))
    .map((violation) => `${violation.id}: ${violation.nodes[0]?.target}`)

const deleteSurveyIfPresent = async (page: Page) => {
  await page.goto("/fr/admin/surveys")
  await expect(page.getByRole("heading", { level: 1, name: "Questionnaires" })).toBeVisible()
  const remove = page.getByRole("button", { name: `Supprimer ${SURVEY.title}` })
  if ((await remove.count()) === 0) return
  const dialog = page.getByRole("alertdialog")
  await expect(async () => {
    await remove.click()
    await expect(dialog).toBeVisible({ timeout: 2_000 })
  }).toPass({ timeout: 30_000 })
  await dialog.getByRole("button", { name: "Supprimer" }).click()
  await expect(page.getByText("Questionnaire et réponses supprimés.")).toBeVisible()
}

test.describe("Surveys", () => {
  test("an unknown survey is a 404 and the export is closed to visitors", async ({ request }) => {
    expect((await request.get("/fr/questionnaire/n-existe-pas")).status()).toBe(404)
    expect((await request.get("/api/admin/surveys/any/export")).status()).toBe(401)
  })

  test.describe("managed by an editor", () => {
    test.skip(!editorCredentials(), MISSING_EDITOR)

    test("an editor builds a survey, a visitor answers it, the editor reads and exports", async ({
      page,
      browser,
    }) => {
      test.setTimeout(150_000)
      await loginAsEditor(page)
      await deleteSurveyIfPresent(page)

      try {
        await page.goto("/fr/admin/surveys/new")
        await page.getByLabel("Titre *").fill(SURVEY.title)
        await expect(page.getByLabel(/^Slug/)).toHaveValue(SURVEY.slug)

        const first = page.getByRole("group", { name: "Question 1" })
        await first.getByLabel("Intitulé *").fill("Comment avez-vous connu le festival ?")
        await first.getByLabel("Question 1, choix 1").fill("Presse")
        await first.getByLabel("Question 1, choix 2").fill("Bouche-à-oreille")
        await first.getByRole("checkbox", { name: "Réponse obligatoire" }).check()

        await page.getByRole("button", { name: "Ajouter une question" }).click()
        const second = page.getByRole("group", { name: "Question 2" })
        await second.getByLabel("Type de réponse").selectOption("rating")
        await second.getByLabel("Intitulé *").fill("Votre note pour la soirée")

        await page.getByRole("button", { name: "Ajouter une question" }).click()
        const third = page.getByRole("group", { name: "Question 3" })
        await third.getByLabel("Type de réponse").selectOption("text")
        await third.getByLabel("Intitulé *").fill("Une remarque ?")

        await page.getByRole("checkbox", { name: /Ouvert aux réponses/ }).check()
        await page.getByRole("button", { name: "Créer le questionnaire" }).click()
        await expect(page).toHaveURL(/\/admin\/surveys$/, { timeout: 15_000 })
        await expect(page.getByText("Ouvert aux réponses")).toBeVisible()

        // The visitor has no admin session.
        const visitorContext = await browser.newContext({
          baseURL: test.info().project.use.baseURL,
        })
        const visitor = await visitorContext.newPage()
        await visitor.goto(`/fr/questionnaire/${SURVEY.slug}`)
        await expect(visitor.getByRole("heading", { level: 1, name: SURVEY.title })).toBeVisible()
        await visitor.getByRole("button", { name: "Envoyer mes réponses" }).click()
        await expect(
          visitor.getByRole("alert").filter({ hasText: "Certaines réponses sont manquantes" })
        ).toBeFocused()
        await expect(visitor.getByText("Merci de répondre à cette question.")).toBeVisible()
        expect(await blockingViolations(visitor)).toEqual([])

        await visitor.getByRole("radio", { name: "Bouche-à-oreille" }).check()
        await visitor.getByText("4", { exact: true }).click()
        await visitor.getByLabel(/Une remarque/).fill("Magnifique, merci !")
        await visitor.getByRole("button", { name: "Envoyer mes réponses" }).click()
        await expect(
          visitor.getByRole("heading", { name: "Merci pour vos réponses !" })
        ).toBeFocused()

        await visitor.goto(`/fr/questionnaire/${SURVEY.slug}/imprimer`)
        await expect(
          visitor.getByRole("img", { name: /questionnaire\/votre-avis-e2e$/ })
        ).toBeVisible()
        await expect(visitor.getByText("1. Comment avez-vous connu le festival ? *")).toBeVisible()
        await visitorContext.close()

        await page.goto("/fr/admin/surveys")
        await page.getByRole("link", { name: `Résultats de ${SURVEY.title}` }).click()
        await expect(page.getByText("1 réponse · ouvert aux réponses")).toBeVisible()
        await expect(page.getByText("moyenne 4,0 / 5")).toBeVisible()
        await expect(page.getByText("Magnifique, merci !")).toBeVisible()

        const download = page.waitForEvent("download")
        await page.getByRole("link", { name: "Exporter les réponses (CSV)" }).click()
        const csv = await (await download).createReadStream()
        const chunks: Buffer[] = []
        for await (const chunk of csv) chunks.push(chunk as Buffer)
        const content = Buffer.concat(chunks).toString("utf8")
        expect(content).toContain("Comment avez-vous connu le festival ?")
        expect(content).toContain(";fr;Bouche-à-oreille;4;Magnifique, merci !")
      } finally {
        await deleteSurveyIfPresent(page)
      }
    })
  })
})
