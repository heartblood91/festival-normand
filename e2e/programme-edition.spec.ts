import { test, expect } from "@playwright/test"
import { hasDatabase, query } from "./helpers/db"

// Design audit #8: the programme mixed last year's events under the current edition.
// Default view = current edition (events from 1 January of the edition year);
// earlier events live under « Éditions précédentes » and their pages say which edition they were.

type EditionCounts = { year: number; current: number; past: number }

const editionCounts = async (): Promise<EditionCounts> => {
  const [edition] = await query<{ year: number }>(
    "select year from editions order by year desc limit 1"
  )
  const year = edition?.year ?? 2027
  const [counts] = await query<{ current: string; past: string }>(
    `select count(*) filter (where date_start >= make_date($1, 1, 1)) as current,
            count(*) filter (where date_start < make_date($1, 1, 1)) as past
       from events where published = true`,
    [year]
  )
  return { year, current: Number(counts.current), past: Number(counts.past) }
}

test.describe("programme: editions", () => {
  test.skip(!hasDatabase(), "Needs DATABASE_URL to count events per edition")

  test("the programme lists the current edition by default", async ({ page }) => {
    const { year, current } = await editionCounts()
    test.skip(current === 0, "No current-edition event: covered by the fallback test")
    await page.goto("/fr/evenements")
    const switcher = page.getByRole("navigation", { name: "Édition" })
    await expect(switcher.getByRole("link", { name: `Édition ${year}` })).toHaveAttribute(
      "aria-current",
      "page"
    )
    await expect(page.getByText(new RegExp(`^${current} événements?$`)).first()).toBeVisible()
  })

  test("previous editions are one link away and say so", async ({ page }) => {
    const { past } = await editionCounts()
    test.skip(past === 0, "No previous-edition event in this database")
    await page.goto("/fr/evenements")
    await page
      .getByRole("navigation", { name: "Édition" })
      .getByRole("link", { name: "Éditions précédentes" })
      .click()
    await expect(page).toHaveURL(/edition=past/)
    await expect(page.getByText(new RegExp(`^${past} événements?$`)).first()).toBeVisible()
    await expect(
      page.getByRole("navigation", { name: "Édition" }).getByRole("link", {
        name: "Éditions précédentes",
      })
    ).toHaveAttribute("aria-current", "page")
  })

  test("a search with no match in this edition offers the previous ones", async ({ page }) => {
    const { year } = await editionCounts()
    const [archived] = await query<{ slug: string; title: string }>(
      `select slug, title_fr as title from events e
        where published = true and date_start < make_date($1, 1, 1)
          and not exists (select 1 from events c where c.published = true
            and c.date_start >= make_date($1, 1, 1) and c.title_fr ilike '%' || e.title_fr || '%')
        order by date_start desc limit 1`,
      [year]
    )
    test.skip(!archived, "No previous-edition event in this database")
    await page.goto(`/fr/evenements?search=${encodeURIComponent(archived.title)}`)
    await page.getByRole("link", { name: "Chercher dans les éditions précédentes" }).click()
    await expect(page).toHaveURL(/edition=past/)
    await expect(page.locator(`a[href$="/evenement/${archived.slug}"]`).first()).toBeVisible()
  })

  test("an event of a previous edition is marked as archived", async ({ page }) => {
    const { year } = await editionCounts()
    const [archived] = await query<{ slug: string; year: number }>(
      `select slug, extract(year from date_start)::int as year from events
        where published = true and date_start < make_date($1, 1, 1) order by date_start desc limit 1`,
      [year]
    )
    test.skip(!archived, "No previous-edition event in this database")
    await page.goto(`/fr/evenement/${archived.slug}`)
    await expect(page.getByTestId("edition-archive")).toContainText(`Édition ${archived.year}`)
  })

  test("an event of the current edition has no archive badge", async ({ page }) => {
    const { year } = await editionCounts()
    const [currentEvent] = await query<{ slug: string }>(
      `select slug from events where published = true and date_start >= make_date($1, 1, 1)
        order by date_start limit 1`,
      [year]
    )
    test.skip(!currentEvent, "No current-edition event in this database")
    await page.goto(`/fr/evenement/${currentEvent.slug}`)
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
    await expect(page.getByTestId("edition-archive")).toHaveCount(0)
  })
})
