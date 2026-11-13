import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { TURNSTILE_FIELD, verifyTurnstile } from "@/lib/turnstile"

const formWith = (token?: string) => {
  const formData = new FormData()
  if (token !== undefined) formData.set(TURNSTILE_FIELD, token)
  return formData
}

const fetchMock = vi.fn()

describe("verifyTurnstile", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock)
    fetchMock.mockReset()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("lets every form through when Turnstile is not configured", async () => {
    vi.stubEnv("TURNSTILE_SITE_KEY", "")
    vi.stubEnv("TURNSTILE_SECRET_KEY", "secret")
    expect(await verifyTurnstile(formWith())).toBe(true)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  describe("when configured", () => {
    beforeEach(() => {
      vi.stubEnv("TURNSTILE_SITE_KEY", "site")
      vi.stubEnv("TURNSTILE_SECRET_KEY", "secret")
    })

    it("rejects a form without a token, without calling Cloudflare", async () => {
      expect(await verifyTurnstile(formWith())).toBe(false)
      expect(await verifyTurnstile(formWith(""))).toBe(false)
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it("follows Cloudflare's verdict and forwards the visitor address", async () => {
      fetchMock.mockResolvedValueOnce(Response.json({ success: true }))
      expect(await verifyTurnstile(formWith("tok"), "1.2.3.4")).toBe(true)
      const body = fetchMock.mock.calls[0][1].body as URLSearchParams
      expect(body.get("response")).toBe("tok")
      expect(body.get("remoteip")).toBe("1.2.3.4")

      fetchMock.mockResolvedValueOnce(Response.json({ success: false }))
      expect(await verifyTurnstile(formWith("tok"))).toBe(false)
    })

    it("does not lock visitors out when Cloudflare is unreachable", async () => {
      fetchMock.mockRejectedValueOnce(new Error("timeout"))
      expect(await verifyTurnstile(formWith("tok"))).toBe(true)
      fetchMock.mockResolvedValueOnce(new Response("", { status: 503 }))
      expect(await verifyTurnstile(formWith("tok"))).toBe(true)
    })
  })
})
