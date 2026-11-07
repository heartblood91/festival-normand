import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR, republishEvent } from "./helpers/admin"

const NO_COVER_EVENT = "Visite guidée du Moulin d'Andé"
const SELECT_PREFIX = "Sélectionner "

const rowTitles = async (page: Page) => {
  const labels = await page
    .getByRole("checkbox", { name: /^Sélectionner (?!tous)/ })
    .evaluateAll((boxes) => boxes.map((box) => box.getAttribute("aria-label") ?? ""))
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
      const box = page.getByRole("checkbox", { name: SELECT_PREFIX + title })
      if (await box.count()) {
        await box.check()
        await page.getByRole("button", { name: "Retirer de la une" }).click()
        await expect(page.getByText("1 événement retiré de la une.")).toBeVisible()
      }
    }
  })

  test("bulk publish skips a cover without alt and names it", async ({ page }) => {
    await page.goto("/fr/admin/events?todo=missing-alt&status=published&sort=title")
    const [blocked] = await rowTitles(page)
    test.skip(!blocked, "Every published cover already has an alt")

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
      await expect(row(page, NO_COVER_EVENT).getByLabel("Publié")).toBeVisible()
      await expect(row(page, blocked).getByLabel("Dépublié")).toBeVisible()
    } finally {
      await republishEvent(page, `/fr${blockedEdit}`)
      await republishEvent(page, `/fr${noCoverEdit}`)
    }
  })

  test("the dashboard to-do counters open the matching list", async ({ page }) => {
    await page.goto("/fr/admin")
    const todo = page.getByRole("region", { name: "À traiter" })
    const missingEn = todo.getByRole("link", { name: /Traduction EN manquante/ })
    const count = Number((await missingEn.textContent())?.match(/\d+$/)?.[0])

    await missingEn.click()
    await expect(page).toHaveURL(/\/admin\/events\?todo=missing-en$/)
    expect(await resultCount(page)).toBe(count)
  })
})
