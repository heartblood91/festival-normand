import { test, expect } from "@playwright/test"
import {
  describeCoverIfMissing,
  editorCredentials,
  loginAsEditor,
  MISSING_EDITOR,
} from "./helpers/admin"
import { hasDatabase, query } from "./helpers/db"

// Suggestions are normally stored by scripts/match-collectes.ts --write.
const FIXTURES = [
  { code: "e2e-1", title: "Collecte e2e de la chapelle", reason: "commune", distance: 0 },
  { code: "e2e-2", title: "Collecte e2e du moulin", reason: "distance", distance: 4.2 },
]
const fixtureUrl = (code: string) =>
  `https://www.fondation-patrimoine.org/les-projets/collecte-${code}/${code}`

type EventRow = {
  id: string
  slug: string
  title_fr: string
  fundraising_url: string | null
  fundraising_title: string | null
  fundraising_image: string | null
}

test.describe("Fondation du patrimoine collects", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)
  test.skip(!hasDatabase(), "Needs DATABASE_URL to store suggestion fixtures")
  test.describe.configure({ mode: "serial" })
  // Login, admin form and two public pages: slow on a cold dev server.
  test.setTimeout(90_000)

  let event: EventRow

  test.beforeAll(async () => {
    ;[event] = await query<EventRow>(
      `select id, slug, title_fr, fundraising_url, fundraising_title, fundraising_image
       from events where published order by slug limit 1`
    )
    for (const fixture of FIXTURES) {
      await query(
        `insert into fundraising_suggestions
           (id, event_id, project_code, url, title, city, reason, distance_km, collected_percent, updated_at)
         values ($1, $2, $3, $4, $5, 'COMMUNE E2E', $6, $7, 35, now())
         on conflict (event_id, project_code) do update set status = 'PENDING'`,
        [
          `${fixture.code}-${event.id}`,
          event.id,
          fixture.code,
          fixtureUrl(fixture.code),
          fixture.title,
          fixture.reason,
          fixture.distance,
        ]
      )
    }
  })

  test.afterAll(async () => {
    await query(
      `delete from fundraising_suggestions where event_id = $1 and project_code like 'e2e-%'`,
      [event.id]
    )
    await query(
      `update events set fundraising_url = $2, fundraising_title = $3, fundraising_image = $4
       where id = $1`,
      [event.id, event.fundraising_url, event.fundraising_title, event.fundraising_image]
    )
  })

  test.beforeEach(async ({ page }) => {
    await loginAsEditor(page)
  })

  test("an editor attaches a nearby collect, shown on the event page and card", async ({
    page,
  }) => {
    await page.goto(`/fr/admin/events/${event.id}/edit`)
    const suggestions = page.getByRole("region", { name: "Collectes proches à valider" })
    await expect(suggestions.getByText("même commune (COMMUNE E2E) · 35 % collectés")).toBeVisible()
    await expect(suggestions.getByText("COMMUNE E2E, à 4,2 km · 35 % collectés")).toBeVisible()

    await expect(async () => {
      await suggestions
        .getByRole("button", { name: `Associer la collecte « ${FIXTURES[0].title} »` })
        .click({ timeout: 2_000 })
      await expect(page.getByLabel("Lien de la collecte")).toHaveValue(fixtureUrl("e2e-1"), {
        timeout: 2_000,
      })
    }).toPass({ timeout: 20_000 })
    await expect(page.getByLabel("Titre affiché")).toHaveValue(FIXTURES[0].title)
    await expect(suggestions.getByText("Associée")).toBeVisible()

    await page.goto(`/fr/evenement/${event.slug}`)
    const callout = page.getByRole("region", { name: "Soutenir la restauration de ce lieu" })
    await expect(callout.getByText(FIXTURES[0].title)).toBeVisible()
    const donate = callout.getByRole("link", { name: /Faire un don/ })
    await expect(donate).toHaveAttribute("href", fixtureUrl("e2e-1"))
    await expect(donate).toHaveAttribute("target", "_blank")
    await expect(donate).toHaveAttribute("rel", /noopener/)

    await page.goto(`/fr/evenements?edition=all&search=${encodeURIComponent(event.title_fr)}`)
    const card = page.locator(`a[href$="/evenement/${event.slug}"]`).first()
    await expect(card.getByText("Collecte", { exact: true })).toBeVisible()
  })

  test("an ignored suggestion is gone for good", async ({ page }) => {
    await page.goto(`/fr/admin/events/${event.id}/edit`)
    const suggestions = page.getByRole("region", { name: "Collectes proches à valider" })
    const ignore = suggestions.getByRole("button", {
      name: `Ignorer la collecte « ${FIXTURES[1].title} »`,
    })
    await expect(async () => {
      await ignore.click({ timeout: 2_000 })
      await expect(ignore).toHaveCount(0, { timeout: 2_000 })
    }).toPass({ timeout: 20_000 })

    await page.reload()
    await expect(page.getByText(FIXTURES[1].title)).toHaveCount(0)
  })

  test("a link outside fondation-patrimoine.org is refused", async ({ page }) => {
    await page.goto(`/fr/admin/events/${event.id}/edit`)
    const draftKey = `pel-admin-draft:event:${event.id}`
    try {
      await describeCoverIfMissing(page)
      await page.getByLabel("Lien de la collecte").fill("https://example.com/collecte")
      await page.getByRole("button", { name: "Mettre à jour" }).click()
      await expect(page.locator("#fundraisingUrl-error")).toHaveText(
        "Le lien doit pointer vers une collecte sur https://www.fondation-patrimoine.org",
        { timeout: 15_000 }
      )
      await expect(page.getByLabel("Lien de la collecte")).toHaveAttribute("aria-invalid", "true")
      await expect(page).toHaveURL(/\/edit$/)
    } finally {
      await page.evaluate((key) => localStorage.removeItem(key), draftKey)
    }
  })
})
