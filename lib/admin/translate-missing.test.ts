import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockTranslate } = vi.hoisted(() => ({ mockTranslate: vi.fn() }))

vi.mock("@/lib/actions/ai-publish", () => ({ translateMultipleFields: mockTranslate }))

import { translateMissingFields } from "./translate-missing"

describe("translateMissingFields", () => {
  beforeEach(() => mockTranslate.mockReset())

  it("translates only empty targets and returns the newly filled fields", async () => {
    mockTranslate.mockResolvedValue({ description: "Text", title: "Ignored" })

    const filled = await translateMissingFields({
      title: ["Titre", "Existing"],
      description: ["Texte", ""],
    })

    expect(mockTranslate).toHaveBeenCalledWith({ description: "Texte" }, "fr", "en")
    expect(filled).toEqual({ description: "Text" })
  })

  it("does not call the AI when every translation exists", async () => {
    expect(await translateMissingFields({ title: ["Titre", "Title"] })).toEqual({})
    expect(mockTranslate).not.toHaveBeenCalled()
  })

  it("returns nothing when the AI gives blank proposals", async () => {
    mockTranslate.mockResolvedValue({ title: " " })
    expect(await translateMissingFields({ title: ["Titre", ""] })).toEqual({})
  })
})
