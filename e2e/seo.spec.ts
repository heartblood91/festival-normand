import { test, expect } from "@playwright/test"

test.describe("SEO: Sitemap", () => {
  test("sitemap.xml is accessible and contains expected URLs", async ({ page }) => {
    const response = await page.goto("/sitemap.xml")
    expect(response?.status()).toBe(200)

    const content = await page.content()
    expect(content).toContain("<urlset")
    expect(content).toContain("<url>")
    expect(content).toContain("/evenements")
    expect(content).toContain("/actualites")
    expect(content).toContain("/contact")
  })

  test("sitemap contains event detail URLs", async ({ page }) => {
    const response = await page.goto("/sitemap.xml")
    expect(response?.status()).toBe(200)

    const content = await page.content()
    expect(content).toContain("/evenement/")
  })

  test("sitemap contains news article URLs", async ({ page }) => {
    const response = await page.goto("/sitemap.xml")
    expect(response?.status()).toBe(200)

    const content = await page.content()
    expect(content).toContain("/actualite/")
  })
})

test.describe("SEO: Robots.txt", () => {
  test("robots.txt is accessible and allows crawling", async ({ page }) => {
    const response = await page.goto("/robots.txt")
    expect(response?.status()).toBe(200)

    const content = await page.locator("body").innerText()
    expect(content).toContain("User-Agent: *")
    expect(content).toContain("Allow: /")
    expect(content).toContain("Disallow: /admin/")
    expect(content).toContain("Sitemap:")
  })
})

test.describe("SEO: Meta tags", () => {
  test("homepage has correct title and meta description", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/Pierres en Lumières/)

    const description = page.locator('meta[name="description"]')
    await expect(description).toHaveAttribute("content", /patrimoine normand/)
  })

  test("homepage has OG tags", async ({ page }) => {
    await page.goto("/")

    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toHaveAttribute("content", /Pierres en Lumières/)

    const ogType = page.locator('meta[property="og:type"]')
    await expect(ogType).toHaveAttribute("content", "website")

    const ogSiteName = page.locator('meta[property="og:site_name"]')
    await expect(ogSiteName).toHaveAttribute("content", "Pierres en Lumières")
  })

  test("events page has meta tags", async ({ page }) => {
    await page.goto("/evenements")
    await expect(page).toHaveTitle(/Événements/)

    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toHaveAttribute("content", /Événements/)
  })

  test("news page has meta tags", async ({ page }) => {
    await page.goto("/actualites")
    await expect(page).toHaveTitle(/Actualités/)

    const ogTitle = page.locator('meta[property="og:title"]')
    await expect(ogTitle).toHaveAttribute("content", /Actualités/)
  })

  test("event detail page has dynamic meta tags", async ({ page }) => {
    await page.goto("/evenements")
    const firstEvent = page.locator('a[href^="/evenement/"]').first()
    await expect(firstEvent).toBeVisible()
    const href = await firstEvent.getAttribute("href")

    if (href) {
      await page.goto(href)
      const ogType = page.locator('meta[property="og:type"]')
      await expect(ogType).toHaveAttribute("content", "article")
    }
  })
})

test.describe("Accessibility: Keyboard navigation", () => {
  test("skip-nav link is functional", async ({ page }) => {
    await page.goto("/")

    const skipLink = page.getByText("Aller au contenu principal")
    await expect(skipLink).toBeAttached()

    // Focus the skip-nav and verify it becomes visible
    await skipLink.focus()
    await expect(skipLink).toBeVisible()

    // Click and verify main content is accessible
    await skipLink.click()
    const main = page.locator("#main-content")
    await expect(main).toBeVisible()
  })

  test("tab navigation reaches all main nav links", async ({ page }) => {
    await page.goto("/")

    // Skip-nav link + logo + nav items should all be focusable
    const focusableInHeader = page.locator(
      "header a, header button"
    )
    const count = await focusableInHeader.count()
    expect(count).toBeGreaterThan(5)
  })

  test("heading hierarchy is correct on homepage", async ({ page }) => {
    await page.goto("/")

    const h1s = page.locator("h1")
    expect(await h1s.count()).toBe(1)
    await expect(h1s.first()).toContainText("Pierres en Lumières")

    const h2s = page.locator("h2")
    expect(await h2s.count()).toBeGreaterThan(0)
  })

  test("heading hierarchy is correct on events page", async ({ page }) => {
    await page.goto("/evenements")

    const h1s = page.locator("h1")
    expect(await h1s.count()).toBe(1)
    await expect(h1s.first()).toContainText("Événements")
  })

  test("all images have alt attributes", async ({ page }) => {
    await page.goto("/")

    const images = page.locator("img")
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt")
      expect(alt).not.toBeNull()
    }
  })

  test("semantic HTML structure on homepage", async ({ page }) => {
    await page.goto("/")

    await expect(page.locator("header")).toBeVisible()
    await expect(page.locator("main#main-content")).toBeVisible()
    await expect(page.locator("footer")).toBeVisible()
    await expect(page.locator('nav[aria-label="Navigation principale"]')).toBeVisible()
  })
})
