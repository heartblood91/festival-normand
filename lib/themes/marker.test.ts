import { describe, it, expect } from "vitest"
import { DEFAULT_PIN_COLOR, themePin } from "./marker"

describe("themePin", () => {
  it("falls back to the festival amber without a theme", () => {
    expect(themePin([])).toEqual({ color: DEFAULT_PIN_COLOR, marker: null })
  })

  it("takes the colour of the first theme in display order", () => {
    expect(
      themePin([
        { order: 2, color: "#111111", markerImage: "/b.svg" },
        { order: 1, color: "#222222", markerImage: null },
      ])
    ).toEqual({ color: "#222222", marker: "/b.svg" })
  })

  it("takes the marker of the first theme that has one", () => {
    expect(
      themePin([
        { order: 0, color: "#222222", markerImage: null },
        { order: 1, color: "#111111", markerImage: "/themes/millennium-marker.svg" },
      ])
    ).toEqual({ color: "#222222", marker: "/themes/millennium-marker.svg" })
  })
})
