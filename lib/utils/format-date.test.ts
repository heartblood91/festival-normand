import { describe, it, expect } from "vitest"
import { formatEventDate, formatEventDateRange } from "./format-date"

describe("formatEventDateRange", () => {
  it("renders a single date when no end is provided", () => {
    const out = formatEventDateRange(new Date("2026-05-29T20:00:00"), null, "fr")
    expect(out).toBe(formatEventDate(new Date("2026-05-29T20:00:00"), "fr"))
  })

  it("collapses to single date when start and end fall on the same day", () => {
    const out = formatEventDateRange(
      new Date("2026-05-29T20:00:00"),
      new Date("2026-05-29T23:00:00"),
      "fr"
    )
    expect(out).toBe(formatEventDate(new Date("2026-05-29T20:00:00"), "fr"))
  })

  it("renders a same-month range with day-only on the start side (FR)", () => {
    const out = formatEventDateRange(
      new Date("2026-05-29T20:00:00"),
      new Date("2026-05-31T22:00:00"),
      "fr"
    )
    // Expect "ven. 29 – dim. 31 mai" (locale formats may differ slightly across Node versions)
    expect(out).toMatch(/29.*–.*31 mai/)
  })

  it("renders both full dates when the range crosses months", () => {
    const out = formatEventDateRange(
      new Date("2026-05-29T20:00:00"),
      new Date("2026-06-02T22:00:00"),
      "fr"
    )
    expect(out).toMatch(/mai.*–.*juin/)
  })

  it("supports the EN locale", () => {
    const out = formatEventDateRange(
      new Date("2026-05-29T20:00:00"),
      new Date("2026-05-31T22:00:00"),
      "en"
    )
    expect(out).toMatch(/29.*–.*May 31/)
  })
})
