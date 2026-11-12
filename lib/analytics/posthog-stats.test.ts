import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("@/lib/cache", () => ({ cachedQuery: (fn: () => unknown) => fn }))

import { fillDays, getAudienceStats, isPostHogStatsConfigured } from "./posthog-stats"

const fetchMock = vi.fn()

const reply = (results: unknown[][]) =>
  Promise.resolve(new Response(JSON.stringify({ results }), { status: 200 }))

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  vi.stubEnv("POSTHOG_PERSONAL_API_KEY", "phx_test")
  vi.stubEnv("POSTHOG_PROJECT_ID", "12345")
  vi.stubEnv("POSTHOG_API_HOST", "")
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe("PostHog audience stats", () => {
  it("needs a personal key and a numeric project id", () => {
    expect(isPostHogStatsConfigured()).toBe(true)
    vi.stubEnv("POSTHOG_PROJECT_ID", "abc")
    expect(isPostHogStatsConfigured()).toBe(false)
    vi.stubEnv("POSTHOG_PROJECT_ID", "12345")
    vi.stubEnv("POSTHOG_PERSONAL_API_KEY", " ")
    expect(isPostHogStatsConfigured()).toBe(false)
  })

  it("returns null without calling PostHog when not configured", async () => {
    vi.stubEnv("POSTHOG_PERSONAL_API_KEY", "")
    expect(await getAudienceStats()).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("queries public page views only and maps the results", async () => {
    fetchMock
      .mockImplementationOnce(() => reply([[120, 45]]))
      .mockImplementationOnce(() =>
        reply([
          ["2026-11-10", 70],
          ["2026-11-11", 50],
        ])
      )
      .mockImplementationOnce(() => reply([["/fr", 60]]))
      .mockImplementationOnce(() => reply([["$direct", 80]]))

    const stats = await getAudienceStats()

    expect(stats).toEqual({
      pageviews: 120,
      visitors: 45,
      daily: [
        { day: "2026-11-10", views: 70 },
        { day: "2026-11-11", views: 50 },
      ],
      topPages: [{ path: "/fr", views: 60 }],
      referrers: [{ domain: "$direct", views: 80 }],
    })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe("https://eu.posthog.com/api/projects/12345/query/")
    expect(init.headers.Authorization).toBe("Bearer phx_test")
    for (const [, call] of fetchMock.mock.calls) {
      expect(JSON.parse(call.body).query.query).toContain("NOT LIKE '%/admin%'")
    }
  })

  it("returns null when PostHog fails", async () => {
    fetchMock.mockResolvedValue(new Response("nope", { status: 403 }))
    expect(await getAudienceStats()).toBeNull()
  })

  it("fills days without visits so the time axis stays regular", () => {
    expect(fillDays([{ day: "2026-11-11", views: 4 }], "2026-11-12", 3)).toEqual([
      { day: "2026-11-10", views: 0 },
      { day: "2026-11-11", views: 4 },
      { day: "2026-11-12", views: 0 },
    ])
  })
})
