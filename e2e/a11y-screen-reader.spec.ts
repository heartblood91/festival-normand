import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"
import { hasDatabase, query } from "./helpers/db"

// What a screen reader announces, beyond what axe checks: page language (RGAA 8.3),
// landmarks and skip links (12.6, 12.7), definition lists (9.3) and link names (6.1).

const DEFAULT_TITLE = "Pierres en Lumières - Festival du Patrimoine Normand"

/** Tab once from the top of the page, follow the skip link, Tab again: focus must land in main. */
const expectSkipLinkReachesMain = async (page: Page) => {
  await page.keyboard.press("Tab")
  const skip = page.locator(":focus")
  await expect(skip).toHaveAttribute("href", "#main-content")
  await page.keyboard.press("Enter")
  await expect(page.locator("main#main-content")).toBeFocused()
}

/** Each list opens with a <dt> and every <dt> is followed by at least one <dd>. */
const definitionListsInOrder = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll("dl")].flatMap((list) => {
      const items = [...list.querySelectorAll("dt, dd")].filter(
        (item) => item.closest("dl") === list
      )
      const problems = items[0]?.tagName === "DD" ? [`dd first: ${items[0].textContent}`] : []
      return problems.concat(
        items
          .filter((item, index) => item.tagName === "DT" && items[index + 1]?.tagName !== "DD")
          .map((item) => `dt without dd: ${item.textContent}`)
      )
    })
  )

test.describe("screen reader: page language", () => {
  for (const locale of ["fr", "en"]) {
    for (const path of ["", "/evenements", "/page-inexistante"]) {
      test(`/${locale}${path} declares lang=${locale}`, async ({ page }) => {
        await page.goto(`/${locale}${path}`)
        await expect(page.locator("html")).toHaveAttribute("lang", locale)
      })
    }
  }
})

test.describe("screen reader: landmarks and skip links", () => {
  for (const path of ["/fr", "/fr/evenements", "/fr/page-inexistante", "/en/page-inexistante"]) {
    test(`${path} has banner, main, contentinfo and a working skip link`, async ({ page }) => {
      await page.goto(path)
      await expect(page.getByRole("banner")).toHaveCount(1)
      await expect(page.getByRole("main")).toHaveCount(1)
      await expect(page.getByRole("contentinfo")).toHaveCount(1)
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
      await expectSkipLinkReachesMain(page)
    })
  }

  test("an unknown page answers 404 inside the site layout", async ({ page }) => {
    const response = await page.goto("/en/page-inexistante")
    expect(response?.status()).toBe(404)
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found")
    await expect(page.getByRole("navigation", { name: "Main navigation" })).toBeVisible()
  })
})

test.describe("screen reader: event page", () => {
  // RGAA 8.7: Mapbox ships English control labels; they must follow the page language.
  test("asides are named and the map controls speak French", async ({ page }) => {
    await page.goto("/fr/evenements")
    const href = await page.locator('a[href*="/evenement/"]').first().getAttribute("href")
    await page.goto(href!)
    await expect(page.getByRole("complementary", { name: "Informations pratiques" })).toBeVisible()
    const around = page.getByRole("complementary", { name: "Localisation et alentours" })
    await expect(around).toBeVisible()
    const hasMap = (await around.getByRole("heading", { name: "Localisation" }).count()) > 0
    test.skip(!hasMap, "no map on this event")
    await expect(around.getByRole("button", { name: "Zoomer", exact: true })).toBeVisible({
      timeout: 15_000,
    })
    await expect(around.getByRole("button", { name: "Zoom in" })).toHaveCount(0)
  })
})

test.describe("screen reader: home content", () => {
  test("definition lists read term then value", async ({ page }) => {
    await page.goto("/fr")
    expect(await definitionListsInOrder(page)).toEqual([])
  })

  test("festival nights read as a full date", async ({ page }) => {
    await page.goto("/fr")
    const nights = page.locator('a[href*="/evenements?date="]')
    await expect(nights.first()).toBeVisible()
    for (const night of await nights.all()) {
      await expect(night).toHaveAccessibleName(
        /^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche) \d{1,2} \S+ \d{4}/
      )
    }
  })

  test("event and news card links start with their title, not a picture", async ({ page }) => {
    for (const path of ["/fr", "/fr/evenements", "/fr/actualites"]) {
      await page.goto(path)
      const images = page.locator('a[href*="/evenement/"] img, a[href*="/actualite/"] img')
      for (const image of await images.all()) {
        await expect(image).toHaveAttribute("alt", "")
      }
    }
  })
})

test.describe("screen reader: contact details", () => {
  test("press email and phone are links", async ({ page }) => {
    await page.goto("/fr/contact")
    await expect(page.getByRole("link", { name: "presse@pierresenlumieres.fr" })).toHaveAttribute(
      "href",
      "mailto:presse@pierresenlumieres.fr"
    )
    await expect(page.getByRole("link", { name: "+33 2 32 76 24 80" })).toHaveAttribute(
      "href",
      "tel:+33232762480"
    )
  })
})

test.describe("screen reader: mobile menu and external links", () => {
  test("the mobile menu traps focus, closes on Escape and gives focus back", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/fr")
    const trigger = page.getByRole("button", { name: "Ouvrir le menu" })
    await trigger.click()
    const menu = page.getByRole("dialog")
    await expect(menu).toBeVisible()
    for (let i = 0; i < 15; i += 1) {
      await page.keyboard.press("Tab")
      await expect(menu.locator(":focus")).toHaveCount(1)
    }
    await page.keyboard.press("Escape")
    await expect(menu).toBeHidden()
    await expect(trigger).toBeFocused()
  })

  test("links opening a new tab say so", async ({ page }) => {
    await page.goto("/fr")
    const links = page.locator('a[target="_blank"]')
    expect(await links.count()).toBeGreaterThan(0)
    for (const link of await links.all()) {
      await expect(link).toHaveAccessibleName(/nouvel onglet/)
    }
  })
})

test.describe("screen reader: admin", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)

  test("admin pages have a skip link, a specific title and the page language", async ({ page }) => {
    test.setTimeout(120_000)
    await loginAsEditor(page)
    for (const path of [
      "/fr/admin",
      "/fr/admin/events",
      "/fr/admin/events/new",
      "/fr/admin/settings",
      "/en/admin",
    ]) {
      await page.goto(path)
      await expect(page).not.toHaveTitle(DEFAULT_TITLE)
      await expect(page.locator("html")).toHaveAttribute("lang", path.slice(1, 3))
      await expectSkipLinkReachesMain(page)
    }
  })

  test("the new-event action is a single link, not a button inside a link", async ({ page }) => {
    await loginAsEditor(page)
    await page.goto("/fr/admin/events")
    const create = page.getByRole("link", { name: "Nouvel événement" })
    await expect(create).toHaveAttribute("href", "/fr/admin/events/new")
    await expect(create.locator("button")).toHaveCount(0)
  })
})

test.describe("screen reader: event photo gallery", () => {
  test.skip(!hasDatabase(), "Needs DATABASE_URL to find an event with several photos")

  test("speaks the page language, announces the photo shown and has 44px buttons", async ({
    page,
  }) => {
    const [event] = await query<{ slug: string; total: number }>(
      `select e.slug, count(p.id)::int as total from events e join photos p on p.event_id = e.id
       where e.published group by e.slug having count(p.id) > 1 order by e.slug limit 1`
    )
    test.skip(!event, "No published event with several photos")
    await page.goto(`/en/evenement/${event.slug}`)

    const gallery = page.getByRole("region", { name: "Photo gallery" })
    const next = gallery.getByRole("button", { name: "Next photo" })
    await expect(gallery.getByRole("button", { name: "Previous photo" })).toBeVisible()
    for (const button of [next, gallery.getByRole("button", { name: "Previous photo" })]) {
      const box = await button.boundingBox()
      expect(box?.width).toBeGreaterThanOrEqual(44)
      expect(box?.height).toBeGreaterThanOrEqual(44)
    }
    await expect(gallery.getByRole("tab")).toHaveCount(0)

    await next.click()
    await expect(gallery.getByRole("status")).toHaveText(`Photo 2 of ${event.total}`)
    await expect(
      gallery.getByRole("button", { name: `Photo 2 of ${event.total}` })
    ).toHaveAttribute("aria-current", "true")
    await expect(gallery.locator("text=/ sur /")).toHaveCount(0)
  })
})
