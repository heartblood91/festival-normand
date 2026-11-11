import AxeBuilder from "@axe-core/playwright"
import { test, expect, type Page } from "@playwright/test"
import { editorCredentials, loginAsEditor, MISSING_EDITOR } from "./helpers/admin"

// RGAA 4.1 maps onto WCAG 2.1 A/AA: only those rules gate the build.
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]
const BLOCKING = new Set(["serious", "critical"])

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
]

const PUBLIC_PATHS = [
  "",
  "/evenements",
  "/evenements?view=map",
  "/inscription",
  "/carnet",
  "/actualites",
  "/festival",
  "/contact",
  "/accessibilite",
  "/mentions-legales",
  "/page-inexistante",
]

const ADMIN_PATHS = [
  "/fr/admin/login",
  "/fr/admin",
  "/fr/admin/events",
  "/fr/admin/events/new",
  "/fr/admin/news",
  "/fr/admin/news/new",
  "/fr/admin/themes",
  "/fr/admin/partners",
  "/fr/admin/pages",
  "/fr/admin/edition",
  "/fr/admin/inscription",
  "/fr/admin/settings",
]

/** Blocking violations as readable lines: rule, impact and the first offending nodes. */
const blockingViolations = async (page: Page) => {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze()
  return results.violations
    .filter((violation) => BLOCKING.has(violation.impact ?? ""))
    .map(
      (violation) =>
        `${page.url()} [${violation.impact}] ${violation.id}: ${violation.help} — ${violation.nodes
          .slice(0, 3)
          .map((node) => node.target.join(" "))
          .join(" | ")}`
    )
}

const firstHref = async (page: Page, listPath: string, selector: string) => {
  await page.goto(listPath)
  return page.locator(selector).first().getAttribute("href")
}

const visit = async (page: Page, path: string) => {
  await page.goto(path, { waitUntil: "networkidle" })
  // Scroll once so lazy sections and scroll-reveal content are in their final state.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 40))
    }
    window.scrollTo(0, 0)
  })
  // Let reveal fades finish: axe would read half-transparent text as low contrast.
  await page.waitForFunction(() =>
    document
      .getAnimations()
      .every(
        (animation) =>
          animation.playState !== "running" ||
          !Number.isFinite(Number(animation.effect?.getComputedTiming().endTime))
      )
  )
}

test.describe("axe: public pages", () => {
  for (const viewport of VIEWPORTS) {
    for (const locale of ["fr", "en"]) {
      test(`${locale} at ${viewport.width}px has no serious or critical violation`, async ({
        page,
      }) => {
        test.setTimeout(240_000)
        await page.setViewportSize(viewport)
        const event = await firstHref(page, `/${locale}/evenements`, 'a[href*="/evenement/"]')
        const news = await firstHref(page, `/${locale}/actualites`, 'a[href*="/actualite/"]')
        const paths = [...PUBLIC_PATHS.map((path) => `/${locale}${path}`), event, news].filter(
          (path): path is string => !!path
        )

        const violations: string[] = []
        for (const path of paths) {
          await visit(page, path)
          violations.push(...(await blockingViolations(page)))
        }
        expect(violations, violations.join("\n")).toEqual([])
      })
    }
  }
})

test.describe("axe: admin pages", () => {
  test.skip(!editorCredentials(), MISSING_EDITOR)

  for (const viewport of VIEWPORTS) {
    test(`admin at ${viewport.width}px has no serious or critical violation`, async ({ page }) => {
      test.setTimeout(240_000)
      await page.setViewportSize(viewport)
      const violations: string[] = []
      await visit(page, ADMIN_PATHS[0])
      violations.push(...(await blockingViolations(page)))

      await loginAsEditor(page)
      const editUrl = await firstHref(
        page,
        "/fr/admin/events",
        'a[href*="/admin/events/"][href$="/edit"]'
      )
      for (const path of [...ADMIN_PATHS.slice(1), editUrl].filter((p): p is string => !!p)) {
        await visit(page, path)
        violations.push(...(await blockingViolations(page)))
      }
      expect(violations, violations.join("\n")).toEqual([])
    })
  }
})
