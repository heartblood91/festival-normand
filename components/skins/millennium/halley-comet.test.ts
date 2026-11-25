import { describe, expect, it } from "vitest"
import {
  COMET_CODE,
  isTypingTarget,
  nextCodeBuffer,
} from "@/components/skins/millennium/halley-comet"

const element = (matches: boolean, isContentEditable = false) =>
  ({ isContentEditable, closest: () => (matches ? {} : null) }) as unknown as EventTarget

describe("1066 easter egg", () => {
  it("completes the code from single keys and resets on other keys", () => {
    const typed = ["1", "0", "6", "6"].reduce(nextCodeBuffer, "")
    expect(typed).toBe(COMET_CODE)
    expect(["9", "1", "0", "6", "6"].reduce(nextCodeBuffer, "")).toBe(COMET_CODE)
    expect(["1", "0", "Shift", "6", "6"].reduce(nextCodeBuffer, "")).toBe("66")
  })

  it("ignores keys typed in form fields and editable regions", () => {
    expect(isTypingTarget(element(true))).toBe(true)
    expect(isTypingTarget(element(false, true))).toBe(true)
    expect(isTypingTarget(element(false))).toBe(false)
    expect(isTypingTarget(null)).toBe(false)
  })
})
