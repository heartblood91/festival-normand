import { expect, type Page } from "@playwright/test"

/**
 * Local editor account for admin specs, created with
 * `tsx scripts/seed-admin.ts <email> <name> <password> EDITOR`.
 * Specs that need it are skipped when the variables are not set.
 */
export const editorCredentials = () => {
  const email = process.env.E2E_EDITOR_EMAIL
  const password = process.env.E2E_EDITOR_PASSWORD
  return email && password ? { email, password } : null
}

export const MISSING_EDITOR =
  "Set E2E_EDITOR_EMAIL and E2E_EDITOR_PASSWORD (see e2e/helpers/admin.ts)"

export const loginAsEditor = async (page: Page) => {
  const credentials = editorCredentials()
  if (!credentials) throw new Error(MISSING_EDITOR)

  await page.goto("/fr/admin/login")
  await page.getByLabel("Adresse email").fill(credentials.email)
  await page.getByLabel("Mot de passe", { exact: true }).fill(credentials.password)
  await page.getByRole("button", { name: "Se connecter" }).click()
  await expect(page).not.toHaveURL(/\/admin\/login/, { timeout: 15_000 })
}
