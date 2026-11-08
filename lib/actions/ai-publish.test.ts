import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const { mockRequireRole, mockChat } = vi.hoisted(() => ({
  mockRequireRole: vi.fn(),
  mockChat: vi.fn(),
}))

vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("@/lib/ai/openrouter", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/ai/openrouter")>()),
  chatCompletion: mockChat,
}))

import { getAiAvailability, proposeAltText } from "./ai-publish"

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

describe("proposeAltText", () => {
  const original = process.env.OPENROUTER_API_KEY

  beforeEach(() => {
    mockRequireRole.mockReset().mockResolvedValue({ id: "u", role: "EDITOR" })
    mockChat.mockReset()
    process.env.OPENROUTER_API_KEY = "sk-test"
  })

  afterEach(() => {
    process.env.OPENROUTER_API_KEY = original
  })

  it("requires an editor before anything else", async () => {
    mockRequireRole.mockRejectedValue(new Error("Unauthorized: not authenticated"))
    await expect(proposeAltText("https://cdn.example.org/a.jpg", "")).rejects.toThrow(
      "Unauthorized"
    )
    expect(mockChat).not.toHaveBeenCalled()
  })

  it("says when no AI key is configured", async () => {
    process.env.OPENROUTER_API_KEY = ""
    expect(await proposeAltText("https://cdn.example.org/a.jpg", "")).toEqual({
      error: "IA indisponible (clé OpenRouter non configurée)",
    })
  })

  it("never sends non-web URLs to the model", async () => {
    expect(await proposeAltText("data:image/png;base64,AAAA", "")).toEqual({
      error: "Cette image n'est pas accessible publiquement.",
    })
    expect(mockChat).not.toHaveBeenCalled()
  })

  it("sends the image with the page context and cleans the answer", async () => {
    mockChat.mockResolvedValue('"Nef de l’abbaye éclairée aux bougies."')
    expect(
      await proposeAltText("https://cdn.example.org/a.jpg", "Veillée à l'abbaye de Lessay")
    ).toEqual({ alt: "Nef de l’abbaye éclairée aux bougies." })
    const [messages] = mockChat.mock.calls[0]
    expect(messages[1].content).toEqual([
      { type: "text", text: "Contexte de la page : Veillée à l'abbaye de Lessay" },
      { type: "image_url", image_url: { url: "https://cdn.example.org/a.jpg" } },
    ])
  })

  it("reports a model failure instead of throwing", async () => {
    mockChat.mockRejectedValue(new Error("OpenRouter API error: 500"))
    expect(await proposeAltText("https://cdn.example.org/a.jpg", "")).toEqual({
      error: "La proposition a échoué. Réessayez plus tard.",
    })
  })
})
