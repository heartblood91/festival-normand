import { test, expect, type Page } from "@playwright/test"
import {
  describeCoverIfMissing,
  editorCredentials,
  loginAsEditor,
  MISSING_EDITOR,
  republishEvent,
} from "./helpers/admin"

const openPublishReview = async (page: Page) => {
  await page.getByRole("button", { name: "Publier", exact: true }).click()
  const wizard = page.getByRole("dialog")
  await expect(wizard.getByRole("button", { name: "Next" })).toBeEnabled({ timeout: 30_000 })
  return wizard
}

test.describe("Admin publish workflow", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)

  test.beforeEach(async ({ page }) => {
    await loginAsEditor(page)
  })

  test("cancelling the publish review keeps a new event as a draft", async ({ page }) => {
    await page.goto("/fr/admin/events/new")
    await expect(page.getByText("Brouillon", { exact: true })).toBeVisible()

    await page.getByRole("button", { name: "Publier", exact: true }).click()
    const wizard = page.getByRole("dialog")
    await expect(wizard).toBeVisible()
    if (!process.env.OPENROUTER_API_KEY) {
      await expect(wizard.getByRole("status")).toContainText("Vérifications IA indisponibles")
    }

    await wizard.getByRole("button", { name: "Cancel" }).click()
    await expect(wizard).toBeHidden()
    await expect(page.getByText("Brouillon", { exact: true })).toBeVisible()
    await expect(page).toHaveURL(/\/admin\/events\/new/)
  })

  test("saving an already published event skips the AI review", async ({ page }) => {
    await page.goto("/fr/admin/events?status=published")
    await page
      .getByRole("link", { name: /^Modifier / })
      .first()
      .click()
    await expect(page).toHaveURL(/\/admin\/events\/[^/]+\/edit/)
    await expect(page.getByText("Publié", { exact: true })).toBeVisible()
    await describeCoverIfMissing(page)

    await page.getByRole("button", { name: "Mettre à jour" }).click()
    await expect(page.getByRole("dialog")).toHaveCount(0)
    await expect(page).toHaveURL(/\/admin\/events(\?|$)/, { timeout: 15_000 })
  })

  test("a draft is published through the review, then saved once", async ({ page }) => {
    await page.goto("/fr/admin/events?status=published")
    await page
      .getByRole("link", { name: /^Modifier / })
      .last()
      .click()
    await expect(page).toHaveURL(/\/admin\/events\/[^/]+\/edit/)
    const editUrl = page.url()

    try {
      await describeCoverIfMissing(page)
      // Unpublishing never opens the review.
      await page.getByRole("button", { name: "Dépublier" }).click()
      await expect(page).toHaveURL(/\/admin\/events(\?|$)/, { timeout: 15_000 })

      await page.goto(editUrl)
      await expect(page.getByText("Brouillon", { exact: true })).toBeVisible()
      await describeCoverIfMissing(page)
      const wizard = await openPublishReview(page)
      await wizard.getByRole("button", { name: "Confirmation" }).click()
      if (!process.env.OPENROUTER_API_KEY) {
        // Nothing was analysed, so nothing may be reported as passed.
        await expect(wizard.getByText("Non vérifié", { exact: true })).toHaveCount(3)
      }
      await wizard.getByRole("button", { name: "Publish Now" }).click()

      await expect(page.getByText("Événement mis à jour avec succès.")).toBeVisible({
        timeout: 15_000,
      })
      await expect(page).toHaveURL(/\/admin\/events(\?|$)/)
      await page.goto(editUrl)
      await expect(page.getByText("Publié", { exact: true })).toBeVisible()
    } finally {
      // The shared local DB must keep its seeded events published, even after a failure.
      await republishEvent(page, editUrl)
    }
  })

  test("AI tools are real buttons that say when no AI key is configured", async ({ page }) => {
    test.skip(!!process.env.OPENROUTER_API_KEY, "Checks the no-key state")
    await page.goto("/fr/admin/events/new")
    await expect(page.getByText(/^IA indisponible/)).toBeVisible()
    for (const name of ["Traduire", "SEO", "RGAA"]) {
      const button = page.getByRole("button", { name, exact: true })
      await expect(button).toBeDisabled()
      await expect(button).toHaveAccessibleDescription(/clé OpenRouter non configurée/)
    }
    await expect(page.getByText(/À venir/)).toHaveCount(0)
  })

  test("static pages show no publication state", async ({ page }) => {
    await page.goto("/fr/admin/pages")
    await page
      .getByRole("link", { name: /^Modifier / })
      .first()
      .click()
    await expect(page).toHaveURL(/\/admin\/pages\/[^/]+\/edit/)
    await expect(page.getByRole("button", { name: "Mettre à jour" })).toBeVisible()
    await expect(page.getByText("Publié", { exact: true })).toHaveCount(0)
    await expect(page.getByRole("button", { name: "Publier", exact: true })).toHaveCount(0)
  })
})
