import { describe, it, expect, vi, beforeEach } from "vitest"

const { chatMock } = vi.hoisted(() => ({ chatMock: vi.fn() }))

vi.mock("@/lib/ai/openrouter", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/ai/openrouter")>()),
  chatCompletion: chatMock,
}))

import { correctImportedTexts } from "./correct-texts"

const texts = {
  title: "VISITE DU CHATEAU DE CANON",
  description: "Venez decouvrir le chateau illumine le samedi 22 mai a 21h.",
}

describe("correctImportedTexts", () => {
  beforeEach(() => {
    chatMock.mockReset()
  })

  it("returns the proofread texts", async () => {
    chatMock.mockResolvedValue(
      '```json\n{"title": "Visite du château de Canon", "description": "Venez découvrir le château illuminé le samedi 22 mai à 21 h."}\n```'
    )
    await expect(correctImportedTexts(texts)).resolves.toEqual({
      title: "Visite du château de Canon",
      description: "Venez découvrir le château illuminé le samedi 22 mai à 21 h.",
    })
  })

  it("keeps the original when the model rewrites instead of proofreading", async () => {
    chatMock.mockResolvedValue(
      JSON.stringify({ title: "Canon", description: "Une soirée magique vous attend !" })
    )
    await expect(correctImportedTexts(texts)).resolves.toEqual(texts)
  })

  it("keeps the original when the answer is not JSON", async () => {
    chatMock.mockResolvedValue("Désolé, je ne peux pas.")
    await expect(correctImportedTexts(texts)).resolves.toEqual(texts)
  })

  it("lets a model error through so the event stays pending", async () => {
    chatMock.mockRejectedValue(new Error("OpenRouter API error: 429"))
    await expect(correctImportedTexts(texts)).rejects.toThrow("429")
  })
})
