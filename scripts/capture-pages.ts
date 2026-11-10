// Full-page screenshots + layout checks of the public pages, for design reviews.
//   pnpm tsx scripts/capture-pages.ts --base https://… --out docs/screenshots/design/before --prefix before
// Read-only: only GET navigations. Prints one JSON line per page.
import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { chromium, type Page } from "@playwright/test"

const arg = (name: string, fallback: string) => {
  const index = process.argv.indexOf(`--${name}`)
  return index > -1 ? process.argv[index + 1] : fallback
}

const base = arg("base", "http://127.0.0.1:3013")
const out = arg("out", "docs/screenshots/design/after")
const prefix = arg("prefix", "after")
const eventSlug = arg("event", "lumieres-au-chateau-de-pontecoulant-1")
const newsSlug = arg("news", "des-artistes-proposent-leurs-services-pour-animer-votre-patrimoine")

const admin = process.argv.includes("--admin")

const publicPages: [string, string][] = [
  ["home", "/fr"],
  ["programme", "/fr/evenements"],
  ["evenement", `/fr/evenement/${eventSlug}`],
  ["inscription", "/fr/inscription"],
  ["carnet", "/fr/carnet"],
  ["actualites", "/fr/actualites"],
  ["actualite", `/fr/actualite/${newsSlug}`],
  ["festival", "/fr/festival"],
  ["contact", "/fr/contact"],
  ["accessibilite", "/fr/accessibilite"],
  ["404", "/fr/page-inexistante"],
  ["home-en", "/en"],
]

// Admin screens need E2E_EDITOR_EMAIL / E2E_EDITOR_PASSWORD in the environment.
const adminPages: [string, string][] = [
  ["admin-dashboard", "/fr/admin"],
  ["admin-events", "/fr/admin/events"],
  ["admin-event-form", "/fr/admin/events/new"],
  ["admin-news", "/fr/admin/news"],
  ["admin-themes", "/fr/admin/themes"],
  ["admin-edition", "/fr/admin/edition"],
  ["admin-partners", "/fr/admin/partners"],
  ["admin-settings", "/fr/admin/settings"],
]

const pages = admin ? adminPages : publicPages

const login = async (page: Page) => {
  const email = process.env.E2E_EDITOR_EMAIL
  const password = process.env.E2E_EDITOR_PASSWORD
  if (!email || !password) throw new Error("Set E2E_EDITOR_EMAIL and E2E_EDITOR_PASSWORD")
  await page.goto(`${base}/fr/admin/login`)
  await page.screenshot({ path: join(out, `${prefix}-admin-login-${page.viewportSize()?.width}.png`) })
  await page.getByLabel("Adresse email").fill(email)
  await page.getByLabel("Mot de passe", { exact: true }).fill(password)
  await page.getByRole("button", { name: "Se connecter" }).click()
  await page.waitForURL((url) => !url.pathname.endsWith("/login"), { timeout: 30_000 })
}

const run = async () => {
  mkdirSync(out, { recursive: true })
  const browser = await chromium.launch()
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: width === 1440 ? 900 : 844 } })
    const page = await context.newPage()
    if (admin) await login(page)
    for (const [name, path] of pages) {
      const errors: string[] = []
      page.removeAllListeners("console")
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text().slice(0, 160))
      })
      const response = await page.goto(base + path, { waitUntil: "networkidle", timeout: 60_000 })
      // Let scroll-reveal and lazy images settle before measuring.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y)
          await new Promise((resolve) => setTimeout(resolve, 60))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForTimeout(500)
      const metrics = await page.evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        h1: document.querySelectorAll("h1").length,
        imagesWithoutAlt: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
        brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0)
          .length,
      }))
      await page.screenshot({ path: join(out, `${prefix}-${name}-${width}.png`), fullPage: true })
      console.log(JSON.stringify({ name, width, status: response?.status(), ...metrics, errors }))
    }
    await context.close()
  }
  await browser.close()
}

run()
