import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const { fakeRedis, redisOptions, local } = vi.hoisted(() => {
  const store = new Map<string, string>()
  const hashes = new Map<string, Map<string, string>>()
  const hashOf = (key: string) => {
    if (!hashes.has(key)) hashes.set(key, new Map())
    return hashes.get(key) as Map<string, string>
  }
  const fakeRedis = {
    store,
    hashes,
    down: false,
    check() {
      if (fakeRedis.down) throw new Error("Stream isn't writeable")
    },
    get: vi.fn(async (key: string) => (fakeRedis.check(), store.get(key) ?? null)),
    set: vi.fn(
      async (key: string, value: string) => (fakeRedis.check(), store.set(key, value), "OK")
    ),
    hmget: vi.fn(async (key: string, ...fields: string[]) => {
      fakeRedis.check()
      return fields.map((field) => hashOf(key).get(field) ?? null)
    }),
    hset: vi.fn(async (key: string, ...pairs: string[]) => {
      fakeRedis.check()
      for (let i = 0; i < pairs.length; i += 2) hashOf(key).set(pairs[i], pairs[i + 1])
      return pairs.length / 2
    }),
    on: vi.fn(),
  }
  const local = {
    get: vi.fn(async () => null as unknown),
    set: vi.fn(async () => undefined),
    revalidateTag: vi.fn(async () => undefined),
  }
  return { fakeRedis, redisOptions: [] as unknown[], local }
})

vi.mock("ioredis", () => ({
  // A class so `new Redis()` works; returning an object from a constructor replaces `this`.
  Redis: class {
    constructor(url: string, options: unknown) {
      redisOptions.push({ url, options })
      return fakeRedis
    }
  },
}))

vi.mock("next/dist/server/lib/incremental-cache/file-system-cache.js", () => ({
  default: class {
    get = local.get
    set = local.set
    revalidateTag = local.revalidateTag
  },
}))

vi.mock("node:fs", () => ({
  readFileSync: vi.fn(() => "build-abc\n"),
}))

type Handler = {
  get: (key: string, ctx: unknown) => Promise<unknown>
  set: (key: string, data: unknown, ctx: unknown) => Promise<void>
  revalidateTag: (tags: string | string[], durations?: { expire?: number }) => Promise<void>
}

const ctx = { serverDistDir: "/app/.next/server", revalidatedTags: [], _requestHeaders: {} }
const pageCtx = { kind: "APP_PAGE", isFallback: false }

const pageValue = (tags = "_N_T_/fr/actualite/x") => ({
  kind: "APP_PAGE",
  html: "<html></html>",
  rscData: Buffer.from("rsc-payload"),
  segmentData: new Map([["/_index", Buffer.from("segment")]]),
  headers: { "x-next-cache-tags": tags },
  status: 200,
  postponed: undefined,
})

const loadHandler = async (): Promise<Handler> => {
  vi.resetModules()
  const handlerModule = await import("./redis-cache-handler.mjs")
  const HandlerClass = handlerModule.default as unknown as new (context: unknown) => Handler
  return new HandlerClass(ctx)
}

describe("redis cache handler", () => {
  beforeEach(() => {
    fakeRedis.store.clear()
    fakeRedis.hashes.clear()
    fakeRedis.down = false
    redisOptions.length = 0
    vi.clearAllMocks()
    vi.spyOn(console, "warn").mockImplementation(() => {})
    vi.stubEnv("REDIS_URL", "redis://cache:6379")
    vi.stubEnv("REDIS_KEY_PREFIX", "")
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("uses Next's file-system cache when REDIS_URL is not set", async () => {
    vi.stubEnv("REDIS_URL", "")
    const handler = await loadHandler()

    await handler.set("/fr", pageValue(), {})
    await handler.get("/fr", pageCtx)

    expect(redisOptions).toHaveLength(0)
    expect(local.set).toHaveBeenCalledOnce()
    expect(local.get).toHaveBeenCalledOnce()
  })

  it("round-trips page entries with buffers and maps under the prefixed build key", async () => {
    const handler = await loadHandler()

    await handler.set("/fr/actualite/x", pageValue(), { cacheControl: { revalidate: 1800 } })
    const [key] = [...fakeRedis.store.keys()]
    const entry = (await handler.get("/fr/actualite/x", pageCtx)) as {
      value: ReturnType<typeof pageValue>
    }

    expect(key).toBe("pel:isr:build-abc:/fr/actualite/x")
    expect(fakeRedis.set).toHaveBeenCalledWith(key, expect.any(String), "EX", 14 * 24 * 60 * 60)
    expect(entry.value.html).toBe("<html></html>")
    expect(Buffer.isBuffer(entry.value.rscData)).toBe(true)
    expect(entry.value.rscData?.toString()).toBe("rsc-payload")
    expect(entry.value.segmentData?.get("/_index")?.toString()).toBe("segment")
    expect(local.set).not.toHaveBeenCalled()
  })

  it("reads REDIS_KEY_PREFIX", async () => {
    vi.stubEnv("REDIS_KEY_PREFIX", "pel-staging:")
    const handler = await loadHandler()

    await handler.set("/en", pageValue(), {})

    expect([...fakeRedis.store.keys()]).toEqual(["pel-staging:isr:build-abc:/en"])
  })

  it("falls back to the build output on a Redis miss", async () => {
    const seeded = { lastModified: Date.now(), value: pageValue("") }
    local.get.mockResolvedValueOnce(seeded)
    const handler = await loadHandler()

    expect(await handler.get("/robots.txt", pageCtx)).toBe(seeded)
  })

  it("drops an entry whose tag was expired, even by a previous process", async () => {
    const handler = await loadHandler()
    await handler.set("/fr/actualite/x", pageValue(), {})

    const restarted = await loadHandler()
    await new Promise((resolve) => setTimeout(resolve, 2))
    await restarted.revalidateTag("_N_T_/fr/actualite/x")

    expect(local.revalidateTag).toHaveBeenCalledWith(["_N_T_/fr/actualite/x"], undefined)
    expect(await (await loadHandler()).get("/fr/actualite/x", pageCtx)).toBeNull()
  })

  it("serves an entry stale after a tag revalidation with a profile", async () => {
    const handler = await loadHandler()
    await handler.set("/fr", pageValue("_N_T_/fr,events"), {})
    await new Promise((resolve) => setTimeout(resolve, 2))
    await handler.revalidateTag(["events"], { expire: 0xfffffffe })

    const entry = (await handler.get("/fr", pageCtx)) as { lastModified: number }

    expect(entry.lastModified).toBe(1)
  })

  it("keeps entries rendered after the invalidation", async () => {
    const handler = await loadHandler()
    await handler.revalidateTag("events")
    await new Promise((resolve) => setTimeout(resolve, 2))
    await handler.set("/fr", pageValue("events"), {})

    const entry = (await handler.get("/fr", pageCtx)) as { lastModified: number }

    expect(entry.lastModified).toBeGreaterThan(1)
  })

  it("checks fetch entries against their tags and soft tags", async () => {
    const handler = await loadHandler()
    const fetchValue = {
      kind: "FETCH",
      data: { headers: {}, body: "[]", url: "" },
      revalidate: 3600,
    }
    await handler.set("sitemap-data", fetchValue, { fetchCache: true, tags: ["sitemap"] })
    await new Promise((resolve) => setTimeout(resolve, 2))
    await handler.revalidateTag("_N_T_/sitemap.xml")

    const fetchCtx = { kind: "FETCH", tags: ["sitemap"], softTags: ["_N_T_/sitemap.xml"] }
    expect(await handler.get("sitemap-data", fetchCtx)).toBeNull()
    expect(await handler.get("sitemap-data", { kind: "FETCH", tags: ["sitemap"] })).not.toBeNull()
  })

  it("fails open on the local cache when Redis is down", async () => {
    const handler = await loadHandler()
    fakeRedis.down = true

    await expect(handler.set("/fr", pageValue(), {})).resolves.toBeUndefined()
    await expect(handler.get("/fr", pageCtx)).resolves.toBeNull()
    await expect(handler.revalidateTag("events")).resolves.toBeUndefined()

    expect(local.set).toHaveBeenCalledOnce()
    expect(local.get).toHaveBeenCalledOnce()
    expect(local.revalidateTag).toHaveBeenCalledOnce()
    expect(console.warn).toHaveBeenCalled()
  })

  it("serves the entry when only the tag lookup fails", async () => {
    const handler = await loadHandler()
    await handler.set("/fr", pageValue(), {})
    fakeRedis.hmget.mockRejectedValueOnce(new Error("timeout"))

    expect(await handler.get("/fr", pageCtx)).not.toBeNull()
  })
})
