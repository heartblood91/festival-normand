import { describe, it, expect, vi, afterEach } from "vitest"

vi.mock("@/lib/prisma", () => ({ prisma: {} }))
vi.mock("@/lib/tourinsoft/sync", () => ({
  runTourinsoftSync: vi.fn(),
  TOURINSOFT_SOURCE: "tourinsoft",
}))

import { getSchedulerIntervalMinutes, isSyncDue } from "./scheduler"

describe("tourinsoft scheduler", () => {
  afterEach(() => vi.unstubAllEnvs())

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

  it("runs when no previous run exists or the interval elapsed", () => {
    const now = new Date("2026-11-07T12:00:00Z")
    expect(isSyncDue(null, 360, now)).toBe(true)
    expect(isSyncDue(new Date("2026-11-07T05:59:00Z"), 360, now)).toBe(true)
    expect(isSyncDue(new Date("2026-11-07T07:00:00Z"), 360, now)).toBe(false)
  })
})
