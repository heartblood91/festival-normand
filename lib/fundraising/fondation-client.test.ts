import { describe, it, expect, vi } from "vitest"
import { fetchFondationProjects } from "@/lib/fundraising/fondation-client"

const hit = (code: string) => ({
  code,
  slug: `projet-${code}`,
  title: `Projet ${code}`,
  city: "CAEN",
  postalCode: "14000",
  departmentCode: "14",
})

const page = (hits: unknown[], pageIndex: number, nbPages: number) =>
  new Response(JSON.stringify({ hits, page: pageIndex, nbPages, nbHits: 3 }), { status: 200 })

describe("fetchFondationProjects", () => {
  it("reads every page of in-progress collects of the region, politely", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(page([hit("1"), hit("2")], 0, 2))
      .mockResolvedValueOnce(page([hit("3"), { code: "bad" }], 1, 2))
    const sleep = vi.fn().mockResolvedValue(undefined)

    const projects = await fetchFondationProjects({ fetcher, sleep, hitsPerPage: 2 })

    expect(projects.map((p) => p.code)).toEqual(["1", "2", "3"])
    expect(fetcher).toHaveBeenCalledTimes(2)
    const [url, init] = fetcher.mock.calls[1]
    expect(url).toBe("https://www.fondation-patrimoine.org/api/v2/search/projects")
    expect(init?.method).toBe("POST")
    expect(JSON.parse(String(init?.body))).toEqual({
      location: { target: "region", value: "28" },
      statuses: ["IN_PROGRESS"],
      hitsPerPage: 2,
      page: 1,
      fetchAll: false,
    })
    expect(new Headers(init?.headers).get("user-agent")).toMatch(/read-only/)
    // One pause between the two requests, none after the last.
    expect(sleep).toHaveBeenCalledTimes(1)
  })

  it("fails loudly on an HTTP error instead of returning a partial list", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response("", { status: 503 }))
    await expect(fetchFondationProjects({ fetcher, sleep: vi.fn() })).rejects.toThrow("503")
  })
})
