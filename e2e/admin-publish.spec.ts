import { test, expect } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

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

    // Unpublishing never opens the review.
    await page.getByRole("button", { name: "Dépublier" }).click()
    await expect(page).toHaveURL(/\/admin\/events(\?|$)/, { timeout: 15_000 })

    await page.goto(editUrl)
    await expect(page.getByText("Brouillon", { exact: true })).toBeVisible()
    await page.getByRole("button", { name: "Publier", exact: true }).click()
    const wizard = page.getByRole("dialog")
    await expect(wizard.getByRole("button", { name: "Next" })).toBeEnabled({ timeout: 30_000 })
    await wizard.getByRole("button", { name: "Confirmation" }).click()
    await wizard.getByRole("button", { name: "Publish Now" }).click()

    await expect(page.getByText("Événement mis à jour avec succès.")).toBeVisible({
      timeout: 15_000,
    })
    await expect(page).toHaveURL(/\/admin\/events(\?|$)/)
    await page.goto(editUrl)
    await expect(page.getByText("Publié", { exact: true })).toBeVisible()
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
