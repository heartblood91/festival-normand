import { test, expect, type Page } from "@playwright/test"

// Design D3: hover halos, scroll reveal, an animated countdown and livelier map markers,
// all of them off under prefers-reduced-motion (RGAA 13.8).

/** Animations or transitions still playing, ignoring the zero-length ones the reduced-motion rule leaves. */
const runningAnimations = (page: Page) =>
  page.evaluate(() =>
    document
      .getAnimations()
      .filter((animation) => {
        const duration = Number(animation.effect?.getComputedTiming().duration ?? 0)
        return animation.playState === "running" && duration > 1
      })
      .map((animation) => {
        const target = (animation.effect as KeyframeEffect | null)?.target
        const name =
          animation instanceof CSSAnimation
            ? animation.animationName
            : animation instanceof CSSTransition
              ? animation.transitionProperty
              : "script"
        return `${name} on ${target?.tagName.toLowerCase()}.${String(target?.className).slice(0, 60)}`
      })
  )

const scrollThrough = (page: Page) =>
  page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 500) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 30))
    }
  })

test.describe("motion: reduced", () => {
  test.beforeEach(({ page }) => page.emulateMedia({ reducedMotion: "reduce" }))

  for (const path of ["/fr", "/fr/evenements", "/fr/actualites"]) {
    test(`${path} plays no animation and hides nothing`, async ({ page }) => {
      await page.goto(path, { waitUntil: "networkidle" })
      await scrollThrough(page)
      expect(await runningAnimations(page)).toEqual([])
      await expect(page.locator('[data-reveal="hidden"]')).toHaveCount(0)
      const hiddenSections = await page.$$eval(
        "main section",
        (sections) => sections.filter((section) => getComputedStyle(section).opacity !== "1").length
      )
      expect(hiddenSections).toBe(0)
    })
  }

  test("the countdown shows its final value at once", async ({ page }) => {
    await page.goto("/fr")
    const countdown = page.getByTestId("hero-countdown")
    test.skip((await countdown.count()) === 0, "No countdown outside the run-up to the festival")
    const final = await countdown.getAttribute("data-value")
    await expect(countdown.locator("[aria-hidden]")).toHaveText(final ?? "")
  })
})

test.describe("motion: allowed", () => {
  test.beforeEach(({ page }) => page.emulateMedia({ reducedMotion: "no-preference" }))

  test("sections below the fold reveal on scroll and stay readable", async ({ page }) => {
    await page.goto("/fr", { waitUntil: "networkidle" })
    const hidden = page.locator('[data-reveal="hidden"]')
    expect(await hidden.count()).toBeGreaterThan(0)
    await scrollThrough(page)
    await expect(hidden).toHaveCount(0)
    // Hidden sections are still in the accessibility tree.
    await expect(page.locator('[data-reveal="shown"] h2').first()).toBeAttached()
  })

  test("the countdown ticks down to the remaining days, read once", async ({ page }) => {
    await page.goto("/fr")
    const countdown = page.getByTestId("hero-countdown")
    test.skip((await countdown.count()) === 0, "No countdown outside the run-up to the festival")
    const final = (await countdown.getAttribute("data-value")) ?? ""
    await expect(countdown.locator(".sr-only")).toHaveText(final)
    await expect(countdown.locator("[aria-hidden]")).toHaveText(final, { timeout: 5_000 })
  })

  test("event cards glow amber on hover and keyboard focus", async ({ page }) => {
    await page.goto("/fr/evenements?edition=all")
    const card = page.locator('a.ed-halo[href*="/evenement/"]').first()
    const glow = () => card.evaluate((element) => getComputedStyle(element).boxShadow)
    expect(await glow()).toBe("none")
    await card.hover()
    await expect.poll(glow).toContain("rgba(245, 158, 11")
    await page.mouse.move(0, 0)
    await card.focus()
    await expect.poll(glow).toContain("rgba(245, 158, 11")
  })

  test("map markers grow and glow on hover and focus", async ({ page }) => {
    await page.goto("/fr/evenement/illumination-abbaye-aux-hommes")
    const marker = page.locator(".pel-map-target").first()
    test.skip(
      !(await marker.waitFor({ timeout: 10_000 }).then(
        () => true,
        () => false
      )),
      "The map did not load (no Mapbox access)"
    )
    const dot = marker.locator("span").first()
    await marker.focus()
    await expect.poll(() => dot.evaluate((e) => getComputedStyle(e).transform)).not.toBe("none")
    await expect
      .poll(() => dot.evaluate((e) => getComputedStyle(e).boxShadow))
      .toContain("rgba(245, 158, 11")
  })
})
