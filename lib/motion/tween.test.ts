import { describe, expect, it } from "vitest"
import { countdownStart, easeOutCubic, tweenNumber } from "./tween"

describe("easeOutCubic", () => {
  it("starts at 0, ends at 1 and stays in range", () => {
    expect(easeOutCubic(0)).toBe(0)
    expect(easeOutCubic(1)).toBe(1)
    expect(easeOutCubic(-1)).toBe(0)
    expect(easeOutCubic(2)).toBe(1)
    expect(easeOutCubic(0.5)).toBeGreaterThan(0.5)
  })
})

describe("tweenNumber", () => {
  it("lands exactly on the target", () => {
    expect(tweenNumber(0, 42, 1)).toBe(42)
    expect(tweenNumber(160, 100, 1)).toBe(100)
  })

  it("starts from the origin and only shows whole numbers", () => {
    expect(tweenNumber(0, 42, 0)).toBe(0)
    expect(Number.isInteger(tweenNumber(0, 7, 0.37))).toBe(true)
  })

  it("counts down when the origin is above the target", () => {
    const halfway = tweenNumber(160, 100, 0.5)
    expect(halfway).toBeLessThan(160)
    expect(halfway).toBeGreaterThan(100)
  })
})

describe("countdownStart", () => {
  it("ticks down from a little above the remaining days", () => {
    expect(countdownStart(120)).toBe(180)
    expect(countdownStart(3)).toBe(63)
  })

  it("does not animate an expired countdown", () => {
    expect(countdownStart(0)).toBe(0)
  })
})
