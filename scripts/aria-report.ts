// Accessibility-tree dump of the key pages, as a screen reader reads them (Chromium ariaSnapshot).
//   pnpm tsx scripts/aria-report.ts --base http://127.0.0.1:3013 --out /tmp/aria [--admin]
// Read-only: GET navigations only. Writes one <page>.yaml per page and prints a JSON summary line.
import { mkdirSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium, type Page } from "@playwright/test"

const arg = (name: string, fallback: string) => {
  const index = process.argv.indexOf(`--${name}`)
  return index > -1 ? process.argv[index + 1] : fallback
}

const base = arg("base", "http://127.0.0.1:3013")
const out = arg("out", "/tmp/aria")
const admin = process.argv.includes("--admin")

const publicPages: [string, string][] = [
  ["home", "/fr"],
  ["programme", "/fr/evenements"],
  ["evenement", "/fr/evenement/illumination-abbaye-aux-hommes"],
  ["carnet", "/fr/carnet"],
  ["inscription", "/fr/inscription"],
  ["contact", "/fr/contact"],
  ["accessibilite", "/fr/accessibilite"],
  ["home-en", "/en"],
]

const adminPages: [string, string][] = [
  ["admin-dashboard", "/fr/admin"],
  ["admin-events", "/fr/admin/events"],
  ["admin-event-form", "/fr/admin/events/new"],
]

const login = async (page: Page) => {
  const email = process.env.E2E_EDITOR_EMAIL
  const password = process.env.E2E_EDITOR_PASSWORD
  if (!email || !password) throw new Error("Set E2E_EDITOR_EMAIL and E2E_EDITOR_PASSWORD")
  await page.goto(`${base}/fr/admin/login`)
  await page.getByLabel("Adresse email").fill(email)
  await page.getByLabel("Mot de passe", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Se connecter" }).click()
  await page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 30_000 })
}

/** Landmarks, heading outline and unnamed controls, computed from the DOM. */
const structure = (page: Page) =>
  page.evaluate(() => {
    const visible = (element: Element) => {
      const style = getComputedStyle(element)
      return style.display !== "none" && style.visibility !== "hidden"
    }
    const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")]
      .filter(visible)
      .map((heading) => ({
        level: Number(heading.tagName[1]),
        text: heading.textContent?.trim() ?? "",
      }))
    const skips = headings
      .slice(1)
      .filter((heading, index) => heading.level > headings[index].level + 1)
      .map((heading) => `h${heading.level} « ${heading.text.slice(0, 50)} »`)
    const landmarks = [
      ...document.querySelectorAll(
        "header, nav, main, footer, aside, [role=banner], [role=navigation], [role=main], [role=contentinfo], [role=search], [role=region], section[aria-label], section[aria-labelledby]"
      ),
    ]
      .filter(visible)
      .map((element) => element.getAttribute("role") ?? element.tagName.toLowerCase())
    const firstFocusable = document.querySelector<HTMLElement>(
      "a[href], button, input, select, textarea, [tabindex]:not([tabindex='-1'])"
    )
    return {
      h1: headings.filter((heading) => heading.level === 1).length,
      headingSkips: skips,
      landmarks: [...new Set(landmarks)],
      liveRegions: document.querySelectorAll("[aria-live], [role=status], [role=alert]").length,
      firstFocusable: firstFocusable?.textContent?.trim().slice(0, 40) ?? null,
      lang: document.documentElement.lang,
      title: document.title,
    }
  })

const run = async () => {
  mkdirSync(out, { recursive: true })
  const browser = await chromium.launch()
  const page = await (
    await browser.newContext({ viewport: { width: 1440, height: 900 } })
  ).newPage()
  // tsx keeps function names with a __name() helper that does not exist in the page.
  await page.addInitScript("window.__name = (fn) => fn")
  if (admin) await login(page)
  for (const [name, path] of admin ? adminPages : publicPages) {
    await page.goto(base + path, { waitUntil: "networkidle" })
    writeFileSync(join(out, `${name}.yaml`), await page.locator("body").ariaSnapshot())
    console.log(JSON.stringify({ name, path, ...(await structure(page)) }))
  }
  await browser.close()
}

run()
