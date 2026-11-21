import { describe, it, expect, vi, afterEach } from "vitest"

const { findFirst, runSync } = vi.hoisted(() => ({ findFirst: vi.fn(), runSync: vi.fn() }))

vi.mock("@/lib/prisma", () => ({ prisma: { syncRun: { findFirst } } }))
vi.mock("@/lib/tourinsoft/sync", () => ({
  runTourinsoftSync: runSync,
  TOURINSOFT_SOURCE: "tourinsoft",
}))

import { getSchedulerIntervalMinutes, msUntilDue, startTourinsoftScheduler } from "./scheduler"

const HOUR_MS = 60 * 60 * 1000

describe("tourinsoft scheduler", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.useRealTimers()
  })

  it("is disabled without TOURINSOFT_SYNC_INTERVAL_MINUTES", () => {
    vi.stubEnv("TOURINSOFT_SYNC_INTERVAL_MINUTES", "")
    expect(getSchedulerIntervalMinutes()).toBeNull()
  })

  it("enforces a 15 minute floor", () => {
    vi.stubEnv("TOURINSOFT_SYNC_INTERVAL_MINUTES", "1")
    expect(getSchedulerIntervalMinutes()).toBe(15)
    vi.stubEnv("TOURINSOFT_SYNC_INTERVAL_MINUTES", "360")
    expect(getSchedulerIntervalMinutes()).toBe(360)
  })

  it("is due without a previous run or once the interval elapsed", () => {
    const now = new Date("2026-11-07T12:00:00Z")
    expect(msUntilDue(null, 360, now)).toBe(0)
    expect(msUntilDue(new Date("2026-11-07T05:59:00Z"), 360, now)).toBe(0)
    expect(msUntilDue(new Date("2026-11-07T07:00:00Z"), 360, now)).toBe(HOUR_MS)
  })

  it("leaves the database alone between two syncs", async () => {
    vi.useFakeTimers({ now: new Date("2026-11-07T12:00:00Z") })
    vi.stubEnv("TOURINSOFT_SYNC_INTERVAL_MINUTES", "360")
    vi.stubEnv("TOURINSOFT_SYNDICATION_URL", "https://example.test/feed")
    // The last sync ran 5 hours ago: the next one is due in an hour.
    findFirst.mockResolvedValue({ startedAt: new Date("2026-11-07T07:00:00Z") })
    runSync.mockImplementation(async () => {
      findFirst.mockResolvedValue({ startedAt: new Date() })
    })

    expect(startTourinsoftScheduler()).toBe(true)
    await vi.advanceTimersByTimeAsync(60 * 1000)
    expect(findFirst).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(HOUR_MS)
    expect(runSync).toHaveBeenCalledTimes(1)
    expect(findFirst).toHaveBeenCalledTimes(2)

    // The sync ran at 13:00 and the clock is at 13:01: no query before 19:00.
    await vi.advanceTimersByTimeAsync(6 * HOUR_MS - 2 * 60 * 1000)
    expect(findFirst).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(60 * 1000)
    expect(findFirst).toHaveBeenCalledTimes(3)
    expect(runSync).toHaveBeenCalledTimes(2)
  })
})
