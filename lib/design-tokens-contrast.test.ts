import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(join(__dirname, "../app/globals.css"), "utf8")

/** Hex custom properties declared in the first block opened by `selector`. */
const tokens = (selector: string) => {
  const start = css.indexOf(`${selector} {`)
  if (start === -1) throw new Error(`No CSS block for ${selector}`)
  const block = css.slice(start, css.indexOf("}", start))
  return Object.fromEntries(
    [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})\b/gi)].map(([, name, value]) => [name, value])
  )
}

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrast = (a: string, b: string) => {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

// RGAA 3.2: 4.5:1 for body text, 3:1 for large text and interface components.
const BODY = 4.5

const root = tokens(":root")
const editorial = { ...root, ...tokens("html:not(.high-contrast) .editorial") }

describe("design token contrast (RGAA 3.2)", () => {
  it.each([
    ["foreground", "background"],
    ["muted-foreground", "background"],
    ["muted-foreground", "muted"],
    ["primary-foreground", "primary"],
    ["primary", "background"],
    ["accent-foreground", "accent"],
  ])("admin %s on %s reaches 4.5:1", (text, surface) => {
    expect(contrast(root[text], root[surface])).toBeGreaterThanOrEqual(BODY)
  })

  it.each([
    ["foreground", "background"],
    ["muted-foreground", "background"],
    ["primary-foreground", "primary"],
    ["primary", "background"],
  ])("public %s on %s reaches 4.5:1", (text, surface) => {
    expect(contrast(editorial[text], editorial[surface])).toBeGreaterThanOrEqual(BODY)
  })

  it.each([
    ["ed-cream", "ed-bg-deep"],
    ["ed-bone", "ed-bg-deep"],
    ["ed-bone", "ed-bg-soft"],
    ["ed-mute", "ed-bg-deep"],
    ["ed-amber-soft", "ed-bg-deep"],
  ])("editorial %s on %s reaches 4.5:1", (text, surface) => {
    expect(contrast(root[text], root[surface])).toBeGreaterThanOrEqual(BODY)
  })
})
