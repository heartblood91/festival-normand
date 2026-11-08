import { existsSync, readFileSync } from "node:fs"
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

// Wiped by Playwright at the start of each run, and ignored by git.
const SESSION_FILE = "test-results/.auth/editor.json"

export const loginAsEditor = async (page: Page) => {
  const credentials = editorCredentials()
  if (!credentials) throw new Error(MISSING_EDITOR)

  // One sign-in per run: production builds rate-limit /sign-in/email.
  if (existsSync(SESSION_FILE)) {
    const { cookies } = JSON.parse(readFileSync(SESSION_FILE, "utf8"))
    await page.context().addCookies(cookies)
    await page.goto("/fr/admin")
    if (!new URL(page.url()).pathname.includes("/admin/login")) return
  }

  await page.goto("/fr/admin/login")
  await page.getByLabel("Adresse email").fill(credentials.email)
  await page.getByLabel("Mot de passe", { exact: true }).fill(credentials.password)
  await page.getByRole("button", { name: "Se connecter" }).click()
  await expect(page).not.toHaveURL(/\/admin\/login/, { timeout: 15_000 })
  await page.context().storageState({ path: SESSION_FILE })
}

/**
 * Seeded events predate the cover alt rule: describe the cover so a published
 * event can be saved again.
 */
export const describeCoverIfMissing = async (page: Page) => {
  const alt = page.getByLabel("Texte alternatif (FR) *")
  if ((await alt.count()) === 0 || (await alt.inputValue()) !== "") return
  await alt.fill("Monument illuminé de nuit pendant le festival")
}

/** Publishes an event again through the review, so specs leave the seed published. */
export const republishEvent = async (page: Page, editUrl: string) => {
  await page.goto(editUrl)
  if ((await page.getByText("Brouillon", { exact: true }).count()) === 0) return
  await describeCoverIfMissing(page)
  await page.getByRole("button", { name: "Publier", exact: true }).click()
  const wizard = page.getByRole("dialog")
  await expect(wizard.getByRole("button", { name: "Suivant" })).toBeEnabled({ timeout: 30_000 })
  await wizard.getByRole("button", { name: "Confirmation" }).click()
  await wizard.getByRole("button", { name: "Publier maintenant" }).click()
  await expect(page).toHaveURL(/\/admin\/events(\?|$)/, { timeout: 15_000 })
}
