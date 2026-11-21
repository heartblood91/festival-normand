// ISR / data cache handler for Next.js (`cacheHandler` in next.config.ts).
//
// Loaded by Next itself, outside the app bundle: it stays plain ESM JavaScript
// so the standalone server can import it without a compile step.
//
// - REDIS_URL set: entries and tag invalidations live in Redis, so they are
//   shared and survive restarts. Keys are namespaced by REDIS_KEY_PREFIX
//   (default "pel:") and by build id: a new deploy never serves HTML that points
//   at the previous build's chunks.
// - REDIS_URL unset (dev, tests, docker build): Next's own file-system cache.
// - Redis unreachable: fail open on the file-system cache and log, never throw.
import { readFileSync } from "node:fs"
import path from "node:path"
import { Redis } from "ioredis"
import fileSystemCacheModule from "next/dist/server/lib/incremental-cache/file-system-cache.js"

const FileSystemCache = fileSystemCacheModule.default ?? fileSystemCacheModule

const CACHE_TAGS_HEADER = "x-next-cache-tags"
// Matches expireTime in next.config.ts: an entry nobody asked for in a week is dropped.
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60
const MIN_TTL_SECONDS = 60
const WARN_INTERVAL_MS = 60_000
// Makes Next treat an entry as past its revalidate window (a falsy 0 would mean "now").
const STALE_LAST_MODIFIED = 1

let redisClient
let lastWarnAt = 0
const buildIds = new Map()

const warn = (operation, error) => {
  const now = Date.now()
  if (now - lastWarnAt < WARN_INTERVAL_MS) return
  lastWarnAt = now
  const reason = error instanceof Error ? error.message : String(error)
  console.warn(`[cache-handler] Redis ${operation} failed, using the local cache: ${reason}`)
}

const getRedis = () => {
  if (redisClient !== undefined) return redisClient
  const url = process.env.REDIS_URL?.trim()
  if (!url) return (redisClient = null)

  redisClient = new Redis(url, {
    connectTimeout: 2_000,
    commandTimeout: 1_000,
    // Fail fast while disconnected so a request falls back instead of waiting.
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
    retryStrategy: (attempt) => Math.min(attempt * 500, 10_000),
  })
  redisClient.on("error", (error) => warn("connection", error))
  return redisClient
}

const readBuildId = (serverDistDir) => {
  if (!serverDistDir) return "development"
  if (!buildIds.has(serverDistDir)) {
    let buildId = "unknown"
    try {
      buildId = readFileSync(path.join(serverDistDir, "..", "BUILD_ID"), "utf8").trim()
    } catch {
      // `next dev` has no BUILD_ID file.
    }
    buildIds.set(serverDistDir, buildId)
  }
  return buildIds.get(serverDistDir)
}

const keyPrefix = () => process.env.REDIS_KEY_PREFIX?.trim() || "pel:"

// JSON with Buffers and Maps (RSC payloads, route bodies, segment data).
// Buffer#toJSON has already run when the replacer sees a buffer.
const isJsonBuffer = (value) =>
  value !== null &&
  typeof value === "object" &&
  value.type === "Buffer" &&
  Array.isArray(value.data)

export const serialize = (entry) =>
  JSON.stringify(entry, (_key, value) => {
    if (isJsonBuffer(value)) return { __t: "buffer", d: Buffer.from(value.data).toString("base64") }
    if (value instanceof Map) return { __t: "map", d: [...value.entries()] }
    return value
  })

export const deserialize = (text) =>
  JSON.parse(text, (_key, value) => {
    if (value && typeof value === "object" && typeof value.__t === "string") {
      if (value.__t === "buffer") return Buffer.from(value.d, "base64")
      if (value.__t === "map") return new Map(value.d)
    }
    return value
  })

const entryTags = (entry, ctx) => {
  const value = entry?.value
  if (!value) return []
  if (value.kind === "FETCH") {
    return [...new Set([...(entry.tags ?? []), ...(ctx?.tags ?? []), ...(ctx?.softTags ?? [])])]
  }
  const header = value.headers?.[CACHE_TAGS_HEADER]
  return typeof header === "string" && header ? header.split(",") : []
}

const ttlSeconds = (ctx) => {
  const expire = ctx?.cacheControl?.expire
  if (typeof expire !== "number" || expire <= 0) return DEFAULT_TTL_SECONDS
  return Math.max(MIN_TTL_SECONDS, Math.min(expire, DEFAULT_TTL_SECONDS))
}

const parseTagState = (raw) => {
  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

export default class RedisCacheHandler {
  constructor(ctx) {
    this.local = new FileSystemCache(ctx)
    this.redis = getRedis()
    const prefix = keyPrefix()
    this.entryPrefix = `${prefix}isr:${readBuildId(ctx.serverDistDir)}:`
    // Tag invalidations are kept across deploys: they only ever compare with
    // the timestamp of the entry they apply to.
    this.tagsKey = `${prefix}isr:tags`
  }

  resetRequestCache() {}

  async get(cacheKey, ctx) {
    if (!this.redis) return this.local.get(cacheKey, ctx)

    let entry
    try {
      const raw = await this.redis.get(this.entryPrefix + cacheKey)
      entry = raw ? deserialize(raw) : await this.local.get(cacheKey, ctx)
    } catch (error) {
      warn("get", error)
      return this.local.get(cacheKey, ctx)
    }
    if (!entry) return null

    const tags = entryTags(entry, ctx)
    if (tags.length === 0) return entry

    let states
    try {
      states = (await this.redis.hmget(this.tagsKey, ...tags)).map(parseTagState)
    } catch (error) {
      // The in-process tags manifest still applies; Redis only adds what
      // happened before this process started.
      warn("tags read", error)
      return entry
    }

    const now = Date.now()
    const { lastModified } = entry
    const expired = states.some(
      ({ expired }) => typeof expired === "number" && expired <= now && expired > lastModified
    )
    if (expired) return null
    const stale = states.some(({ stale }) => typeof stale === "number" && stale > lastModified)
    return stale ? { ...entry, lastModified: STALE_LAST_MODIFIED } : entry
  }

  async set(cacheKey, data, ctx) {
    if (!this.redis) return this.local.set(cacheKey, data, ctx)

    const entry = {
      lastModified: Date.now(),
      value: data,
      tags: ctx?.fetchCache ? (ctx.tags ?? []) : [],
    }
    try {
      await this.redis.set(this.entryPrefix + cacheKey, serialize(entry), "EX", ttlSeconds(ctx))
    } catch (error) {
      warn("set", error)
      await this.local.set(cacheKey, data, ctx)
    }
  }

  async revalidateTag(tags, durations) {
    const list = (typeof tags === "string" ? [tags] : tags).filter(Boolean)
    // Keeps this process's tags manifest current, the same as without Redis.
    await this.local.revalidateTag(list, durations)
    if (!this.redis || list.length === 0) return

    try {
      const now = Date.now()
      const previous = await this.redis.hmget(this.tagsKey, ...list)
      const fields = list.flatMap((tag, index) => {
        const state = parseTagState(previous[index])
        const next = durations
          ? {
              ...state,
              stale: now,
              ...(durations.expire === undefined ? {} : { expired: now + durations.expire * 1000 }),
            }
          : { ...state, expired: now }
        return [tag, JSON.stringify(next)]
      })
      await this.redis.hset(this.tagsKey, ...fields)
    } catch (error) {
      warn("revalidateTag", error)
    }
  }
}
