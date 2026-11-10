import { test, expect } from "@playwright/test"

test.describe("Events list page", () => {
  test("loads and displays the events page title", async ({ page }) => {
    await page.goto("/evenements")
    await expect(page).toHaveTitle(/Événements/)
    await expect(page.getByRole("heading", { name: "Événements", level: 1 })).toBeVisible()
  })

  test("displays event cards in grid", async ({ page }) => {
    await page.goto("/evenements")
    const cards = page.locator('a[href*="/evenement/"]')
    const count = await cards.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })

  test("event cards show titles", async ({ page }) => {
    await page.goto("/evenements")
    const firstCard = page.locator('a[href*="/evenement/"]').first()
    await expect(firstCard.locator("h3")).toBeVisible()
    await expect(firstCard.locator("h3")).not.toHaveText("")
  })

  test("search bar is present and functional", async ({ page }) => {
    await page.goto("/evenements")
    const searchInput = page.getByRole("combobox", {
      name: /Rechercher un événement/i,
    })
    await expect(searchInput).toBeVisible()

    await searchInput.fill("Ca")
    const suggestions = page.locator("#events-city-suggestions")
    await expect(suggestions).toBeVisible()
  })

  test("search navigates with URL params", async ({ page }) => {
    await page.goto("/evenements")
    const searchInput = page.getByRole("combobox", {
      name: /Rechercher un événement/i,
    })
    await searchInput.fill("Caen")
    await searchInput.press("Enter")
    await page.waitForURL(/search=Caen/)
    expect(page.url()).toContain("search=Caen")
  })

  test("filter bar applies filters via URL", async ({ page }) => {
    await page.goto("/evenements")
    // Open category dropdown
    const categoryBtn = page.getByRole("button", { name: "Catégorie" })
    await categoryBtn.click()

    // Select "Illuminations"
    const option = page.getByRole("option", { name: /Illuminations/ })
    await option.click()

    await page.waitForURL(/category=illuminations/)
    expect(page.url()).toContain("category=illuminations")
  })

  test("several nights can be selected together", async ({ page }) => {
    await page.goto("/evenements")
    // Night chips come from the current edition; pick the first and the last.
    // "Ven 21, vendredi 21 mai" (long date for screen readers): theme chips carry a count instead.
    const nightChips = page.locator("button[aria-pressed]").filter({ hasText: /^\S+ \d{1,2},/ })
    const count = await nightChips.count()
    expect(count).toBeGreaterThanOrEqual(2)
    const shortDate = async (chip: typeof nightChips) => (await chip.textContent())!.split(",")[0]
    const first = await shortDate(nightChips.first())
    const last = await shortDate(nightChips.last())

    await nightChips.first().click()
    await page.waitForURL(/date=\d{2}$/)
    await page.locator("button[aria-pressed]").filter({ hasText: last }).click()
    await page.waitForURL(/date=\d{2}(%2C|,)\d{2}/)

    await expect(page.locator("button[aria-pressed]").filter({ hasText: first })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
    await expect(page.locator("button[aria-pressed]").filter({ hasText: last })).toHaveAttribute(
      "aria-pressed",
      "true"
    )
  })

  test("active filters display and can be removed", async ({ page }) => {
    await page.goto("/evenements?category=illuminations")
    const filterChip = page.getByRole("button", {
      name: /Retirer le filtre Illuminations/i,
    })
    await expect(filterChip).toBeVisible()

    await filterChip.click()
    await page.waitForURL((url) => !url.search.includes("category"))
    expect(page.url()).not.toContain("category")
  })

  test("empty state shown when no results", async ({ page }) => {
    await page.goto("/evenements?search=xyznonexistent123")
    await expect(page.getByText("Aucun événement trouvé")).toBeVisible()
  })

  test("event card links navigate to event detail", async ({ page }) => {
    await page.goto("/evenements")
    const firstCard = page.locator('a[href*="/evenement/"]').first()
    const href = await firstCard.getAttribute("href")
    expect(href).toMatch(/\/evenement\//)
  })

  test("navigates from homepage to events page", async ({ page }) => {
    await page.goto("/")
    const link = page.getByRole("link", { name: "Découvrir le programme" }).first()
    await link.click()
    await page.waitForURL(/\/evenements$/)
    await expect(page.getByRole("heading", { name: "Événements", level: 1 })).toBeVisible()
  })
})
