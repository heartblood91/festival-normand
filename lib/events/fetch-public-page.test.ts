import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const { lookupMock } = vi.hoisted(() => ({ lookupMock: vi.fn() }))
vi.mock("node:dns/promises", () => ({ lookup: lookupMock }))

import { fetchPublicPage, isPrivateAddress } from "./fetch-public-page"

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock)
  fetchMock.mockReset()
  lookupMock.mockResolvedValue([{ address: "93.184.216.34", family: 4 }])
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("fetchPublicPage", () => {
  it("knows private and loopback ranges", () => {
    for (const address of [
      "127.0.0.1",
      "10.2.3.4",
      "172.20.0.1",
      "192.168.1.1",
      "169.254.169.254",
      "::1",
      "fd00::1",
      "::ffff:127.0.0.1",
      // What the URL parser makes of http://[::ffff:169.254.169.254]/
      "::ffff:a9fe:a9fe",
      "::ffff:7f00:1",
      "64:ff9b::a9fe:a9fe",
      "2002:7f00:1::",
      "fe80::1",
      "224.0.0.1",
      "not-an-ip",
    ]) {
      expect(isPrivateAddress(address)).toBe(true)
    }
    expect(isPrivateAddress("93.184.216.34")).toBe(false)
    expect(isPrivateAddress("2606:4700::6810:84e5")).toBe(false)
  })

  it("returns the HTML of a public page", async () => {
    fetchMock.mockResolvedValue(
      new Response("<a href='https://facebook.com/x'>fb</a>", {
        headers: { "content-type": "text/html; charset=utf-8" },
      })
    )
    await expect(fetchPublicPage("https://abbaye.fr")).resolves.toEqual({
      url: "https://abbaye.fr/",
      html: "<a href='https://facebook.com/x'>fb</a>",
    })
  })

  it("refuses hosts that resolve to a private network, even after a redirect", async () => {
    lookupMock.mockResolvedValueOnce([{ address: "10.0.0.5", family: 4 }])
    await expect(fetchPublicPage("https://intranet.example")).rejects.toThrow("Private address")

    fetchMock.mockResolvedValueOnce(
      new Response(null, { status: 302, headers: { location: "http://127.0.0.1/admin" } })
    )
    await expect(fetchPublicPage("https://abbaye.fr")).rejects.toThrow("Private address")
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("refuses other schemes and non-HTML answers", async () => {
    await expect(fetchPublicPage("file:///etc/passwd")).rejects.toThrow("Unsupported scheme")
    fetchMock.mockResolvedValue(
      new Response("{}", { headers: { "content-type": "application/json" } })
    )
    await expect(fetchPublicPage("https://abbaye.fr")).rejects.toThrow("Not an HTML page")
  })
})
