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

const s3 = ["S3_ENDPOINT", "S3_BUCKET", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY"] as const
const touched = [...required, ...s3]

const original = Object.fromEntries(touched.map((name) => [name, process.env[name]]))

afterEach(() => {
  for (const name of touched) {
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

  it("accepts S3 instead of Vercel Blob for uploads", async () => {
    for (const name of required) process.env[name] = "configured"
    delete process.env.BLOB_READ_WRITE_TOKEN
    for (const name of s3) process.env[name] = "configured"

    const response = await GET()
    expect(response.status).toBe(200)

    delete process.env.S3_BUCKET
    const body = await (await GET()).json()
    expect(body.missing).toEqual(["S3_* or BLOB_READ_WRITE_TOKEN"])
  })
})
