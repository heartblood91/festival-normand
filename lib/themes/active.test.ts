import { describe, expect, it } from "vitest"
import { activeThemeWhere, isThemeActive, parseThemeYears } from "@/lib/themes/active"

describe("isThemeActive", () => {
  it("shows a theme without years every edition", () => {
    expect(isThemeActive([], 2027)).toBe(true)
    expect(isThemeActive([], 2031)).toBe(true)
  })

  it("shows a dated theme only its years", () => {
    expect(isThemeActive([2027], 2027)).toBe(true)
    expect(isThemeActive([2027], 2028)).toBe(false)
  })
})

describe("activeThemeWhere", () => {
  it("matches undated themes or the edition year", () => {
    expect(activeThemeWhere(2027)).toEqual({
      OR: [{ years: { isEmpty: true } }, { years: { has: 2027 } }],
    })
  })
})

describe("parseThemeYears", () => {
  it("accepts commas, spaces and duplicates", () => {
    expect(parseThemeYears("2028, 2027 2027;2029")).toEqual([2027, 2028, 2029])
  })

  it("treats an empty field as every edition", () => {
    expect(parseThemeYears("  ")).toEqual([])
  })

  it("rejects anything that is not a festival year", () => {
    expect(parseThemeYears("27")).toBeNull()
    expect(parseThemeYears("2027-2028")).toBeNull()
    expect(parseThemeYears("1999")).toBeNull()
  })
})
