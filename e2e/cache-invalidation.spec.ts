import { test, expect, type Page } from "@playwright/test"
import {
  describeCoverIfMissing,
  editorCredentials,
  loginAsEditor,
  MISSING_EDITOR,
} from "./helpers/admin"
import { hasDatabase, query } from "./helpers/db"

const SUFFIX = " (cache e2e)"

const nearbyTitles = (page: Page) =>
  page
    .getByRole("region", { name: /^(Le même jour, à proximité|Les sites les plus proches)$/ })
    .getByRole("link")

const renameEvent = async (page: Page, id: string, title: string) => {
  await page.goto(`/fr/admin/events/${id}/edit`)
  await describeCoverIfMissing(page)
  const slug = await page.getByLabel("Slug").inputValue()
  await page.getByLabel("Titre *").fill(title)
  expect(await page.getByLabel("Slug").inputValue()).toBe(slug)
  await page.getByRole("button", { name: "Mettre à jour" }).click()
  await expect(page).toHaveURL(/\/admin\/events(\?|$)/, { timeout: 15_000 })
}

// Meaningful on a production build only: `next dev` bypasses the data cache.
test.describe("Admin changes reach every cached public page", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)
  test.skip(!hasDatabase(), "Needs DATABASE_URL to restore the renamed event")

  test("a renamed event shows on the page of a neighbour that suggests it", async ({ page }) => {
    // Find an event page whose nearby suggestions list another event.
    const sitemap = await (await page.request.get("/sitemap.xml")).text()
    const pages = [...sitemap.matchAll(/\/fr\/evenement\/([^<]+)<\/loc>/g)].map(([, slug]) => slug)
    let host: string | undefined
    let neighbour: string | undefined
    for (const slug of pages.slice(0, 20)) {
      await page.goto(`/fr/evenement/${slug}`)
      const link = nearbyTitles(page).first()
      if ((await link.count()) === 0) continue
      host = slug
      const href = (await link.getAttribute("href")) ?? ""
      neighbour = decodeURIComponent(href.split("/evenement/")[1] ?? "")
      break
    }
    test.skip(!host || !neighbour, "No published event has a nearby suggestion")

    const [event] = await query<{ id: string; title_fr: string }>(
      "SELECT id, title_fr FROM events WHERE slug = $1",
      [neighbour]
    )
    expect(event, `event ${neighbour} in the database`).toBeDefined()
    // The host page is now in the ISR cache, built with the neighbour's old title.
    await page.goto(`/fr/evenement/${host}`)
    await expect(nearbyTitles(page).filter({ hasText: event.title_fr }).first()).toBeVisible()

    await loginAsEditor(page)
    try {
      await renameEvent(page, event.id, event.title_fr + SUFFIX)
      await page.goto(`/fr/evenement/${host}`)
      await expect(nearbyTitles(page).filter({ hasText: SUFFIX })).toHaveCount(1)

      await renameEvent(page, event.id, event.title_fr)
      await page.goto(`/fr/evenement/${host}`)
      await expect(nearbyTitles(page).filter({ hasText: SUFFIX })).toHaveCount(0)
    } finally {
      // Leaves the shared local DB as found even after a failure; the cache then
      // catches up within its revalidate window.
      await query("UPDATE events SET title_fr = $2 WHERE id = $1", [event.id, event.title_fr])
    }
  })
})
