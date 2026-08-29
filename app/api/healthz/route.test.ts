import { afterEach, describe, expect, it } from "vitest"
import { GET } from "./route"

const required = [
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "BLOB_READ_WRITE_TOKEN",
  "CRON_SECRET",
  "REVALIDATE_TOKEN",
  "TOURINSOFT_SYNDICATION_URL",
] as const

const original = Object.fromEntries(required.map((name) => [name, process.env[name]]))

afterEach(() => {
  for (const name of required) {
    const value = original[name]
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  }
})

describe("GET /api/healthz", () => {
  it("reports liveness without checking the database", async () => {
    for (const name of required) process.env[name] = `${name.toLowerCase()}-configured`

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(200)
    expect(response.headers.get("cache-control")).toContain("no-store")
    expect(body).toMatchObject({
      ok: true,
      service: "pierres-en-lumieres",
      checks: { app: true, database: "not_checked" },
      missing: [],
    })
  })

  it("reports missing non-database configuration", async () => {
    for (const name of required) process.env[name] = "configured"
    delete process.env.CRON_SECRET

    const response = await GET()
    const body = await response.json()

    expect(response.status).toBe(503)
    expect(body.missing).toEqual(["CRON_SECRET"])
  })
})
