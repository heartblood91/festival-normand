import { expect, type Locator, type Page } from "@playwright/test"

const isFocused = (target: Locator) =>
  target.evaluate((element) => element === document.activeElement, null, { timeout: 1_000 })

/** Move focus with Tab only (Shift+Tab when reverse) until the target has it. */
export const tabTo = async (
  page: Page,
  target: Locator,
  { max = 150, reverse = false }: { max?: number; reverse?: boolean } = {}
) => {
  await expect(target).toBeVisible()
  for (let presses = 0; presses < max; presses += 1) {
    if (await isFocused(target).catch(() => false)) return
    await page.keyboard.press(reverse ? "Shift+Tab" : "Tab")
  }
  throw new Error(`Not reached with ${max} × ${reverse ? "Shift+Tab" : "Tab"}: ${target}`)
}

/** Start a keyboard run from the top of a hydrated page. */
export const gotoForKeyboard = async (page: Page, path: string) => {
  await page.goto(path, { waitUntil: "networkidle" })
  await page.locator("body").focus()
}
