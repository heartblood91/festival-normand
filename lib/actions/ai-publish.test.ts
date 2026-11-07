import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const { mockRequireRole } = vi.hoisted(() => ({ mockRequireRole: vi.fn() }))

vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))

import { getAiAvailability } from "./ai-publish"

describe("getAiAvailability", () => {
  const original = process.env.OPENROUTER_API_KEY

  beforeEach(() => {
    mockRequireRole.mockReset().mockResolvedValue({ id: "u", role: "EDITOR" })
  })

  afterEach(() => {
    process.env.OPENROUTER_API_KEY = original
  })

  it("requires an editor", async () => {
    mockRequireRole.mockRejectedValue(new Error("Unauthorized: not authenticated"))
    await expect(getAiAvailability()).rejects.toThrow("Unauthorized")
    expect(mockRequireRole).toHaveBeenCalledWith("EDITOR")
  })

  it("reports whether an OpenRouter key is configured, without exposing it", async () => {
    process.env.OPENROUTER_API_KEY = ""
    expect(await getAiAvailability()).toEqual({ available: false })
    process.env.OPENROUTER_API_KEY = "sk-test"
    expect(await getAiAvailability()).toEqual({ available: true })
  })
})
