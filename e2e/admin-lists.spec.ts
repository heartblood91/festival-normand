import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR, republishEvent } from "./helpers/admin"
import { hasDatabase, query } from "./helpers/db"

const NO_COVER_EVENT = "Visite guidée du Moulin d'Andé"
const SELECT_PREFIX = "Sélectionner "

const rowTitles = async (page: Page) => {
  const boxes = page.getByRole("checkbox", { name: /^Sélectionner (?!tous)/ })
  // On a production build the rows appear after the page load event.
  await expect(boxes.first().or(page.getByText(/^0 résultat/))).toBeVisible()
  const labels = await boxes.evaluateAll((nodes) =>
    nodes.map((box) => box.getAttribute("aria-label") ?? "")
  )
  return labels.map((label) => label.slice(SELECT_PREFIX.length))
}

const row = (page: Page, title: string) =>
  page.getByRole("row").filter({ has: page.getByRole("checkbox", { name: SELECT_PREFIX + title }) })

const resultCount = async (page: Page) =>
  Number((await page.getByText(/^\d+ résultats?$/).textContent())?.split(" ")[0])

test.describe("Admin event lists", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)

  test.beforeEach(async ({ page }) => {
    await loginAsEditor(page)
  })

  test("search and pagination keep every filter and the sort", async ({ page }) => {
    await page.goto("/fr/admin/events?status=published&source=manual&sort=title")
    const search = page.getByLabel("Rechercher des événements")
    await search.fill("Château")
    await search.press("Enter")

    await expect(page).toHaveURL(/search=Ch%C3%A2teau/)
    const query = new URL(page.url()).searchParams
    expect(query.get("status")).toBe("published")
    expect(query.get("source")).toBe("manual")
    expect(query.get("sort")).toBe("title")
    expect(query.get("page")).toBeNull()

    const next = page.locator("a", { has: page.getByLabel("Page suivante") })
    const nextQuery = new URL((await next.getAttribute("href")) ?? "", page.url()).searchParams
    expect(Object.fromEntries(nextQuery)).toMatchObject({
      search: "Château",
      status: "published",
      source: "manual",
      sort: "title",
      page: "2",
    })

    await page.getByRole("button", { name: "Effacer la recherche" }).click()
    await expect(page).not.toHaveURL(/search=/)
    expect(new URL(page.url()).searchParams.get("sort")).toBe("title")
  })

  test("period filter and title sort", async ({ page }) => {
    await page.goto("/fr/admin/events?when=upcoming&sort=title")
    const upcoming = await rowTitles(page)
    expect(upcoming.length).toBeGreaterThan(0)
    expect(upcoming).toEqual(
      [...upcoming].sort((a, b) => a.localeCompare(b, "fr", { sensitivity: "base" }))
    )

    await page.goto("/fr/admin/events?when=past")
    const past = await rowTitles(page)
    expect(past.filter((title) => upcoming.includes(title))).toEqual([])

    await page.goto("/fr/admin/events")
    expect(await resultCount(page)).toBe(upcoming.length + past.length)
  })

  test("bulk feature then unfeature", async ({ page }) => {
    await page.goto("/fr/admin/events?featured=false&sort=title")
    const [title] = await rowTitles(page)
    test.skip(!title, "No event outside the front page")

    try {
      await page.getByRole("checkbox", { name: SELECT_PREFIX + title }).check()
      await page.getByRole("button", { name: "Mettre à la une" }).click()
      await expect(page.getByText("1 événement mis à la une.")).toBeVisible()
      await expect(page.getByRole("checkbox", { name: SELECT_PREFIX + title })).toHaveCount(0)

      await page.goto("/fr/admin/events?featured=true&sort=title")
      await expect(row(page, title).getByLabel("À la une")).toBeVisible()
    } finally {
      await page.goto("/fr/admin/events?featured=true&sort=title")
      // count() does not wait: a cleanup that ran before the rows rendered left every event featured.
      await rowTitles(page)
      const box = page.getByRole("checkbox", { name: SELECT_PREFIX + title })
      if (await box.count()) {
        await box.check()
        await page.getByRole("button", { name: "Retirer de la une" }).click()
        await expect(page.getByText("1 événement retiré de la une.")).toBeVisible()
      }
    }
  })

  test("bulk publish skips a cover without alt and names it", async ({ page }) => {
    test.skip(!hasDatabase(), "Needs DATABASE_URL to clear a cover alt")
    // Other specs describe covers when they save events: clear one alt here.
    const [fixture] = await query<{ id: string; alt: string | null }>(
      `select id, cover_image_alt_fr as alt from events
       where published and cover_image is not null and title_fr <> $1
       order by title_fr limit 1`,
      [NO_COVER_EVENT]
    )
    await query(`update events set cover_image_alt_fr = null where id = $1`, [fixture.id])

    await page.goto("/fr/admin/events?todo=missing-alt&status=published&sort=title")
    const [blocked] = await rowTitles(page)
    expect(blocked).toBeTruthy()

    await page.goto("/fr/admin/events?sort=title")
    const blockedEdit = await page
      .getByRole("link", { name: `Modifier ${blocked}` })
      .getAttribute("href")
    const noCoverEdit = await page
      .getByRole("link", { name: `Modifier ${NO_COVER_EVENT}` })
      .getAttribute("href")

    try {
      const select = async () => {
        await page.getByRole("checkbox", { name: SELECT_PREFIX + NO_COVER_EVENT }).check()
        await page.getByRole("checkbox", { name: SELECT_PREFIX + blocked }).check()
      }
      await select()
      await page.getByRole("button", { name: "Dépublier", exact: true }).last().click()
      await page.getByRole("alertdialog").getByRole("button", { name: "Dépublier" }).click()
      await expect(page.getByText("2 événements dépubliés.")).toBeVisible()

      await select()
      await page.getByRole("button", { name: "Publier", exact: true }).click()
      await expect(
        page.getByText(
          `1 événement publié. Non publié(s) : ${blocked} (image de couverture sans texte alternatif).`
        )
      ).toBeVisible()
      await expect(
        row(page, NO_COVER_EVENT).getByText("Publié", { exact: true }).filter({ visible: true })
      ).toBeVisible()
      await expect(
        row(page, blocked).getByText("Dépublié", { exact: true }).filter({ visible: true })
      ).toBeVisible()
    } finally {
      await republishEvent(page, blockedEdit ?? "")
      await republishEvent(page, noCoverEdit ?? "")
      await query(`update events set cover_image_alt_fr = $2 where id = $1`, [
        fixture.id,
        fixture.alt,
      ])
    }
  })

  test("the dashboard to-do counters open the matching list", async ({ page }) => {
    await page.goto("/fr/admin")
    const todo = page.getByRole("region", { name: "À traiter" })
    const missingEn = todo.getByRole("link", { name: /Traduction EN manquante/ })
    test.skip((await missingEn.count()) === 0, "No missing translation: the counter says « Aucun »")
    const count = Number((await missingEn.textContent())?.match(/\d+$/)?.[0])

    await missingEn.click()
    await expect(page).toHaveURL(/\/admin\/events\?todo=missing-en$/)
    expect(await resultCount(page)).toBe(count)
  })
})
