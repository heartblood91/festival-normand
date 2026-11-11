import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"
import { hasDatabase, query } from "./helpers/db"

// Meeting item: a department publishes its imported (Tourinsoft) events on its own date.
// Before that date they are hidden from the public site; manual events are unaffected.

const setEmbargo = async (page: Page, department: string, date: string) => {
  await page.goto("/fr/admin/edition")
  const input = page.locator(`input[name="${department}"]`)
  await input.fill(date)
  await page.locator("form", { has: input }).getByRole("button", { name: "Enregistrer" }).click()
  await expect(page.getByText("Dates de publication mises à jour.")).toBeVisible()
}

test.describe("department embargo", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)
  test.skip(!hasDatabase(), "Needs DATABASE_URL to pick an imported event")

  test("an embargoed department's imported events leave the site until its date", async ({
    page,
  }) => {
    test.setTimeout(120_000)
    const [event] = await query<{ slug: string; title: string; department: string }>(
      `select slug, title_fr as title, department from events
        where published and tourinsoft_id is not null and date_start >= now()
        order by date_start limit 1`
    )
    test.skip(!event, "No upcoming imported event in this database")
    const before = await query<{ department: string }>("select department from department_settings")
    const original = await query<{ day: string | null }>(
      "select to_char(publish_from, 'YYYY-MM-DD') as day from department_settings where department = $1",
      [event.department]
    )
    const programme = `/fr/evenements?edition=all&search=${encodeURIComponent(event.title)}`
    const card = page.locator(`a[href$="/evenement/${event.slug}"]`)

    await loginAsEditor(page)
    try {
      const nextYear = new Date().getFullYear() + 1
      await setEmbargo(page, event.department, `${nextYear}-12-31`)
      await expect(page.locator(`#${event.department}-status`)).toContainText("Masqué jusqu'au")

      await page.goto(programme)
      await expect(card).toHaveCount(0)
      const hidden = await page.goto(`/fr/evenement/${event.slug}`)
      expect(hidden?.status()).toBe(404)
    } finally {
      await setEmbargo(page, event.department, original[0]?.day ?? "")
      if (before.length === 0) await query("delete from department_settings")
    }

    await page.goto(programme)
    await expect(card.first()).toBeVisible()
    const shown = await page.goto(`/fr/evenement/${event.slug}`)
    expect(shown?.status()).toBe(200)
  })
})
