import { test, expect, type Page } from "@playwright/test"
import {
  describeCoverIfMissing,
  editorCredentials,
  loginAsEditor,
  MISSING_EDITOR,
} from "./helpers/admin"
import { hasDatabase, query } from "./helpers/db"

// Design audit follow-ups (docs/reports/design-audit.md): broken assets, unreadable
// mobile labels, partner grid filler and the contact form when no mailer is configured.

const MIN_FONT_PX = 12

/** Visible elements carrying their own text with a computed size under the floor. */
const tinyTexts = (page: Page) =>
  page.evaluate((min) => {
    const tiny: string[] = []
    for (const element of document.querySelectorAll<Element>("body *")) {
      const ownText = [...element.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => node.textContent?.trim() ?? "")
        .join("")
      if (!ownText) continue
      const rect = element.getBoundingClientRect()
      // sr-only text is clipped to 1px: it is never read visually.
      if (rect.width <= 1 || rect.height <= 1) continue
      const style = getComputedStyle(element)
      if (style.visibility === "hidden" || style.display === "none") continue
      // SVG text is sized in viewBox units: scale it to screen pixels.
      const scale = element instanceof SVGGraphicsElement ? (element.getScreenCTM()?.a ?? 1) : 1
      const size = Math.round(parseFloat(style.fontSize) * scale * 10) / 10
      if (size < min)
        tiny.push(`${element.tagName.toLowerCase()} ${size}px « ${ownText.slice(0, 40)} »`)
    }
    return tiny
  }, MIN_FONT_PX)

test.describe("design: assets", () => {
  for (const path of ["/fr", "/en"]) {
    test(`${path} loads no missing same-origin asset`, async ({ page, baseURL }) => {
      const origin = new URL(baseURL ?? "http://localhost:3010").origin
      const broken: string[] = []
      page.on("response", (response) => {
        const url = new URL(response.url())
        if (url.origin === origin && response.status() >= 400) {
          broken.push(`${response.status()} ${url.pathname}`)
        }
      })
      await page.goto(path, { waitUntil: "networkidle" })
      expect(broken).toEqual([])
    })
  }
})

test.describe("design: mobile legibility", () => {
  test("public pages have no text under 12px at 390px", async ({ page }) => {
    test.setTimeout(120_000)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/fr/evenements")
    const event = await page.locator('a[href*="/evenement/"]').first().getAttribute("href")
    const problems: string[] = []
    for (const path of [
      "/fr",
      "/fr/evenements",
      event ?? "",
      "/fr/actualites",
      "/fr/carnet",
      "/fr/contact",
      "/fr/inscription",
      "/fr/festival",
    ]) {
      await page.goto(path, { waitUntil: "networkidle" })
      problems.push(...(await tinyTexts(page)).map((line) => `${path}: ${line}`))
    }
    expect(problems, problems.join("\n")).toEqual([])
  })

  test("the hero kicker stays on one line at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto("/fr")
    const kicker = page.getByTestId("hero-kicker")
    const lineHeight = await kicker.evaluate((element) =>
      parseFloat(getComputedStyle(element).lineHeight)
    )
    const box = await kicker.boundingBox()
    expect(box?.height ?? 0).toBeLessThan(lineHeight * 1.5)
  })
})

test.describe("design: partners", () => {
  test("the partner list centres its last row instead of leaving filler cells", async ({
    page,
  }) => {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 })
      await page.goto("/fr")
      const list = page.getByTestId("partner-list")
      await list.scrollIntoViewIfNeeded()
      const layout = await list.evaluate((element) => {
        const style = getComputedStyle(element)
        return {
          background: style.backgroundColor,
          display: style.display,
          justify: style.justifyContent,
        }
      })
      expect(layout).toEqual({ background: "rgba(0, 0, 0, 0)", display: "flex", justify: "center" })
    }
  })
})

test.describe("design: contact without a mailer", () => {
  test("a valid message offers a direct email link to the department", async ({ page }) => {
    // The local build runs without RESEND_API_KEY.
    await page.goto("/fr/contact")
    await page.getByLabel(/Nom complet/).fill("Jean Dupont")
    await page.locator("#email").fill(`design-${Date.now()}@example.fr`)
    await page.getByLabel(/Département/).selectOption("CALVADOS")
    await page.getByLabel(/Message/).fill("Bonjour, une question sur les horaires du festival.")
    await page.getByRole("button", { name: /Envoyer/ }).click()

    const notice = page.getByTestId("contact-fallback")
    await expect(notice).toBeVisible({ timeout: 10_000 })
    await expect(notice).toHaveAttribute("role", "alert")
    const mail = notice.getByRole("link", { name: /patrimoine@calvados\.fr/ })
    await expect(mail).toHaveAttribute("href", /^mailto:patrimoine@calvados\.fr\?subject=/)
    // React resets the form after an action: the typed message must survive it.
    await expect(page.getByLabel(/Nom complet/)).toHaveValue("Jean Dupont")
    await expect(page.getByLabel(/Département/)).toHaveValue("CALVADOS")
    await expect(page.getByLabel(/Message/)).toHaveValue(/horaires du festival/)
  })
})

test.describe("design: news without a cover", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)
  test.skip(!hasDatabase(), "Needs DATABASE_URL to clear a news cover")

  /** Saving from the admin is what refreshes the cached public news lists. */
  const saveFromAdmin = async (page: Page, id: string) => {
    await page.goto(`/fr/admin/news/${id}/edit`)
    // Seed covers have no alt text, which the form requires once a cover is set.
    await describeCoverIfMissing(page)
    await page.getByRole("button", { name: "Mettre à jour" }).first().click()
    await expect(page).toHaveURL(/\/admin\/news$/, { timeout: 15_000 })
  }

  test("news without a cover show the illustrated fallback, lead and grid", async ({ page }) => {
    test.setTimeout(120_000)
    // The latest article is the lead; the next one opens the grid.
    const articles = await query<{ id: string; slug: string; cover_image: string | null }>(
      "select id, slug, cover_image from news where published = true and cover_image is not null order by published_at desc limit 2"
    )
    test.skip(articles.length < 2, "Needs two published news with a cover")
    await loginAsEditor(page)
    try {
      for (const article of articles) {
        await query("update news set cover_image = null where id = $1", [article.id])
        await saveFromAdmin(page, article.id)
      }
      await page.goto("/fr/actualites")
      for (const article of articles) {
        const card = page.locator(`a[href$="/actualite/${article.slug}"]`)
        await expect(card.getByTestId("news-thumb-fallback")).toBeVisible()
      }
    } finally {
      for (const article of articles) {
        await query("update news set cover_image = $2 where id = $1", [
          article.id,
          article.cover_image,
        ])
        await saveFromAdmin(page, article.id)
      }
    }
  })
})
