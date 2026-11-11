import { describe, expect, it } from "vitest"
import { isSkinKey, SKINS } from "@/lib/skins/registry"

describe("skin registry", () => {
  it("knows the millennium skin", () => {
    expect(SKINS.millennium).toMatch(/Guillaume/)
    expect(isSkinKey("millennium")).toBe(true)
  })

  it("ignores unknown or removed skins", () => {
    expect(isSkinKey("toString")).toBe(false)
    expect(isSkinKey("removed-skin")).toBe(false)
    expect(isSkinKey(null)).toBe(false)
  })
})
