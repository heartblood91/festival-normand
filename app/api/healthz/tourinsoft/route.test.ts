import { describe, it, expect, vi, beforeEach } from "vitest"

const { getLastRunMock } = vi.hoisted(() => ({ getLastRunMock: vi.fn() }))

vi.mock("@/lib/tourinsoft/sync", () => ({ getLastTourinsoftRun: getLastRunMock }))
vi.mock("@/lib/tourinsoft/scheduler", () => ({ getSchedulerIntervalMinutes: () => 360 }))
vi.mock("@/lib/ai/openrouter", () => ({ isAiConfigured: () => false }))

import { GET } from "./route"

const run = (overrides: Record<string, unknown> = {}) => ({
  status: "SUCCESS",
  trigger: "scheduler",
  startedAt: new Date(),
  finishedAt: new Date(),
  total: 4,
  created: 4,
  updated: 0,
  skipped: 0,
  failed: 0,
  ...overrides,
})

describe("GET /api/healthz/tourinsoft", () => {
  beforeEach(() => {
    getLastRunMock.mockReset()
  })

  it("is healthy after a recent successful run", async () => {
    getLastRunMock.mockResolvedValue(run())
    const response = await GET()
    expect(response.status).toBe(200)
    const body = await response.json()
    expect(body).toMatchObject({
      ok: true,
      schedulerIntervalMinutes: 360,
      aiTranslationConfigured: false,
    })
  })

  it("reports 503 when the import never ran", async () => {
    getLastRunMock.mockResolvedValue(null)
    const response = await GET()
    expect(response.status).toBe(503)
    expect(await response.json()).toMatchObject({ ok: false, stale: true })
  })

  it("reports 503 when the last run is older than 36h", async () => {
    const old = new Date(Date.now() - 40 * 60 * 60 * 1000)
    getLastRunMock.mockResolvedValue(run({ startedAt: old, finishedAt: old }))
    expect((await GET()).status).toBe(503)
  })

  it("does not leak database errors", async () => {
    getLastRunMock.mockRejectedValueOnce(new Error("password authentication failed for user x"))
    const response = await GET()
    expect(response.status).toBe(503)
    expect(JSON.stringify(await response.json())).not.toContain("password")
  })
})
