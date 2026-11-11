import { test, expect } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

// Design audit #20: a bare « 0 » reads as missing data. Empty counters say so in words
// and are not links to an empty list; the others open the matching filtered list.

test.describe("admin dashboard counters", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)

  test("empty counters say so, the others link to their list", async ({ page }) => {
    await loginAsEditor(page)
    await page.goto("/fr/admin")
    const counters = page.getByTestId("dashboard-counter")
    expect(await counters.count()).toBeGreaterThanOrEqual(8)
    for (const counter of await counters.all()) {
      const count = Number(await counter.getAttribute("data-count"))
      const tag = await counter.evaluate((element) => element.tagName)
      if (count === 0) {
        await expect(counter).toContainText(/Aucun/)
        expect(tag).not.toBe("A")
      } else {
        expect(tag).toBe("A")
        await expect(counter).toHaveAttribute("href", /\/fr\/admin\//)
        await expect(counter).toContainText(String(count))
      }
    }
  })

  test("icon-only list actions show their name as a tooltip", async ({ page }) => {
    await loginAsEditor(page)
    for (const list of ["events", "news"]) {
      await page.goto(`/fr/admin/${list}`)
      const actions = page.locator("tbody [aria-label]:is(a, button)")
      expect(await actions.count()).toBeGreaterThan(0)
      for (const action of await actions.all()) {
        await expect(action).toHaveAttribute("title", (await action.getAttribute("aria-label"))!)
      }
    }
  })
})
