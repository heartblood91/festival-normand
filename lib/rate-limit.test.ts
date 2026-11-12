import { beforeEach, describe, expect, it, vi } from "vitest"

const { getRedis, headers } = vi.hoisted(() => ({ getRedis: vi.fn(), headers: vi.fn() }))
vi.mock("@/lib/redis", () => ({ getRedis }))
vi.mock("next/headers", () => ({ headers }))

import { clientKey, createRateLimiter } from "@/lib/rate-limit"

/** Minimal stand-in for ioredis' MULTI/INCR/PEXPIRE/EXEC. */
const fakeRedis = () => {
  const counts = new Map<string, number>()
  const keys: string[] = []
  return {
    keys,
    multi: () => {
      let key = ""
      const chain = {
        incr: (k: string) => ((key = k), chain),
        pexpire: () => chain,
        exec: async () => {
          keys.push(key)
          counts.set(key, (counts.get(key) ?? 0) + 1)
          return [
            [null, counts.get(key)],
            [null, 1],
          ]
        },
      }
      return chain
    },
  }
}

describe("createRateLimiter", () => {
  beforeEach(() => getRedis.mockReset())

  it("limits in memory when Redis is not configured", async () => {
    getRedis.mockReturnValue(null)
    const isLimited = createRateLimiter({ name: "t", windowMs: 60_000, max: 2 })
    expect(await isLimited("a")).toBe(false)
    expect(await isLimited("a")).toBe(false)
    expect(await isLimited("a")).toBe(true)
    expect(await isLimited("b")).toBe(false)
  })

  it("counts in Redis under a namespaced key when it is available", async () => {
    const redis = fakeRedis()
    getRedis.mockReturnValue(redis)
    const isLimited = createRateLimiter({ name: "review", windowMs: 60_000, max: 1 })
    expect(await isLimited("1.2.3.4")).toBe(false)
    expect(await isLimited("1.2.3.4")).toBe(true)
    expect(redis.keys[0]).toMatch(/^pel:rate:review:1\.2\.3\.4:\d+$/)
  })

  it("falls back to memory instead of failing the form when Redis errors", async () => {
    getRedis.mockReturnValue({
      multi: () => {
        throw new Error("Stream isn't writeable")
      },
    })
    const isLimited = createRateLimiter({ name: "t", windowMs: 60_000, max: 1 })
    expect(await isLimited("a")).toBe(false)
    expect(await isLimited("a")).toBe(true)
  })
})

describe("clientKey", () => {
  it("trusts only the hop our proxy appended to X-Forwarded-For", async () => {
    headers.mockResolvedValue(new Headers({ "x-forwarded-for": "6.6.6.6, 1.2.3.4" }))
    expect(await clientKey()).toBe("1.2.3.4")
    headers.mockResolvedValue(new Headers({ "x-real-ip": "5.6.7.8" }))
    expect(await clientKey()).toBe("5.6.7.8")
  })
})
