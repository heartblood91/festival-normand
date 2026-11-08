import { test, expect, type Locator, type Page } from "@playwright/test"

const FALAISE = {
  slug: "visite-nocturne-chateau-falaise",
  title: "Visite nocturne du Château de Falaise",
}
const CAEN = {
  slug: "illumination-abbaye-aux-hommes",
  title: "Illumination de l'Abbaye aux Hommes",
}

const travelBookLink = (page: Page) =>
  page.getByRole("banner").getByRole("link", { name: /^Mon carnet de voyage/ })

// A toggle clicked before hydration does nothing: retry until it is pressed.
const pressUntilOn = async (button: Locator) => {
  await expect(async () => {
    if ((await button.getAttribute("aria-pressed")) !== "true") await button.click()
    await expect(button).toHaveAttribute("aria-pressed", "true", { timeout: 2_000 })
  }).toPass({ timeout: 30_000 })
}

const addFromEventPage = async (page: Page, slug: string) => {
  await page.goto(`/fr/evenement/${slug}`)
  // The visible label switches to "Dans mon carnet" once pressed.
  await pressUntilOn(page.getByRole("button", { name: /^(Ajouter au carnet|Dans mon carnet)$/ }))
}

test.describe("Travel book", () => {
  test("an empty travel book points to the programme", async ({ page }) => {
    await page.goto("/fr/carnet")
    await expect(
      page.getByRole("heading", { level: 1, name: "Mon carnet de voyage" })
    ).toBeVisible()
    await expect(page.getByText("Votre carnet est vide.")).toBeVisible()
    await expect(page.getByRole("link", { name: "Parcourir le programme" })).toHaveAttribute(
      "href",
      "/fr/evenements"
    )
  })

  test("a visitor keeps places without an account, by date or town, and removes one", async ({
    page,
  }) => {
    test.setTimeout(120_000)
    await addFromEventPage(page, FALAISE.slug)
    await expect(page.getByRole("button", { name: "Dans mon carnet" })).toBeVisible()
    await expect(travelBookLink(page)).toHaveAccessibleName("Mon carnet de voyage, 1 lieu")

    await page.goto("/fr/evenements?search=Caen")
    await pressUntilOn(
      page.getByRole("button", { name: `Ajouter « ${CAEN.title} » au carnet de voyage` })
    )
    await expect(travelBookLink(page)).toHaveAccessibleName("Mon carnet de voyage, 2 lieux")

    // Survives a reload: the selection lives in localStorage.
    await travelBookLink(page).click()
    await expect(page).toHaveURL(/\/fr\/carnet$/)
    await expect(page.getByText("2 lieux", { exact: true })).toBeVisible()
    await expect(page.getByRole("link", { name: FALAISE.title })).toBeVisible()
    await expect(page.getByRole("link", { name: CAEN.title })).toBeVisible()
    await expect(page.getByRole("heading", { level: 2, name: /vendredi 29 mai/i })).toBeVisible()

    await page.getByRole("button", { name: "Commune" }).click()
    await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
      "Caen",
      "Falaise",
    ])

    await page
      .getByRole("button", { name: `Retirer « ${CAEN.title} » du carnet de voyage` })
      .click()
    await expect(page.getByRole("link", { name: CAEN.title })).toHaveCount(0)
    await page.reload()
    await expect(page.getByRole("link", { name: FALAISE.title })).toBeVisible()
    await expect(page.getByRole("link", { name: CAEN.title })).toHaveCount(0)

    await page.evaluate(() => {
      ;(window as unknown as { printed: boolean }).printed = false
      window.print = () => {
        ;(window as unknown as { printed: boolean }).printed = true
      }
    })
    await page.getByRole("button", { name: "Imprimer" }).click()
    expect(await page.evaluate(() => (window as unknown as { printed: boolean }).printed)).toBe(
      true
    )
  })

  test("a shared link opens a read-only copy that another visitor can import", async ({
    page,
    browser,
  }) => {
    test.setTimeout(120_000)
    await addFromEventPage(page, FALAISE.slug)
    await addFromEventPage(page, CAEN.slug)

    await page.goto("/fr/carnet")
    await page.getByRole("button", { name: "Partager le carnet" }).click()
    const link = page.getByRole("textbox", { name: "Lien de partage" })
    await expect(link).toHaveValue(/\/fr\/carnet\/[0-9a-f-]{36}$/)
    const url = await link.inputValue()
    await expect(page.getByRole("link", { name: "Envoyer par e-mail" })).toHaveAttribute(
      "href",
      new RegExp(`^mailto:\\?subject=.+&body=.+${encodeURIComponent(url)}`)
    )

    // Sharing the same selection again reuses the same link.
    await page.reload()
    await page.getByRole("button", { name: "Partager le carnet" }).click()
    await expect(page.getByRole("textbox", { name: "Lien de partage" })).toHaveValue(url)

    const visitor = await browser.newContext()
    const other = await visitor.newPage()
    try {
      await other.goto(new URL(url).pathname)
      await expect(
        other.getByRole("heading", { level: 1, name: "Carnet de voyage partagé" })
      ).toBeVisible()
      await expect(other.getByRole("link", { name: FALAISE.title })).toBeVisible()
      await expect(other.getByRole("link", { name: CAEN.title })).toBeVisible()
      await expect(other.getByRole("button", { name: /^Retirer/ })).toHaveCount(0)
      await expect(travelBookLink(other)).toHaveAccessibleName("Mon carnet de voyage")

      const importButton = other.getByRole("button", { name: "Ajouter ces lieux à mon carnet" })
      await expect(async () => {
        await importButton.click()
        await expect(travelBookLink(other)).toHaveAccessibleName("Mon carnet de voyage, 2 lieux", {
          timeout: 2_000,
        })
      }).toPass({ timeout: 30_000 })
    } finally {
      await visitor.close()
    }
  })

  test("an unknown or malformed shared link is a 404", async ({ page }) => {
    const unknown = await page.goto("/fr/carnet/3f0c2b1e-8d4a-4c6f-9b2e-1a2b3c4d5e6f")
    expect(unknown?.status()).toBe(404)
    const malformed = await page.goto("/fr/carnet/not-a-uuid")
    expect(malformed?.status()).toBe(404)
  })
})
