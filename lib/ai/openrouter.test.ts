import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { chatCompletion, extractJson, getAiModel, translateText } from "./openrouter"

const okResponse = (content: string) =>
  new Response(JSON.stringify({ choices: [{ message: { content } }] }), { status: 200 })

describe("openrouter client", () => {
  const fetchMock = vi.fn()

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock)
    vi.stubEnv("OPENROUTER_API_KEY", "test-key")
    vi.stubEnv("OPENROUTER_MODEL", "")
    fetchMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
  })

  it("throws when the API key is missing", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "")
    await expect(chatCompletion([{ role: "user", content: "hi" }])).rejects.toThrow(
      "OPENROUTER_API_KEY not configured"
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("uses an existing default model and lets OPENROUTER_MODEL override it", async () => {
    expect(getAiModel()).toBe("google/gemini-3.5-flash-lite")
    vi.stubEnv("OPENROUTER_MODEL", "custom/model")
    fetchMock.mockResolvedValue(okResponse("ok"))
    await chatCompletion([{ role: "user", content: "hi" }])
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.model).toBe("custom/model")
  })

  it("translates without any session (usable from the cron)", async () => {
    fetchMock.mockResolvedValue(okResponse("  Castle by night  "))
    await expect(translateText("Château de nuit", "fr", "en")).resolves.toBe("Castle by night")
    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.messages[0].content).toContain("French text to English")
  })

  it("rejects on HTTP errors", async () => {
    fetchMock.mockResolvedValue(new Response("nope", { status: 400 }))
    await expect(translateText("x", "fr", "en")).rejects.toThrow("OpenRouter API error: 400")
  })
})

describe("extractJson", () => {
  it("parses fenced JSON", () => {
    expect(extractJson('```json\n[{"a":1}]\n```')).toEqual([{ a: 1 }])
  })

  it("parses JSON surrounded by prose", () => {
    expect(extractJson('Voici : {"title":"x"} merci')).toEqual({ title: "x" })
  })

  it("throws when no JSON is present", () => {
    expect(() => extractJson("rien")).toThrow()
  })
})
