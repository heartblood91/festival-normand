import { headers } from "next/headers"
import { getRedis } from "@/lib/redis"

type RateLimitOptions = {
  /** Namespaces the Redis keys, so two forms never share a counter. */
  name: string
  windowMs: number
  max: number
}

// Past this many tracked clients, idle ones are dropped so memory stays bounded.
const MEMORY_SWEEP_THRESHOLD = 5_000

/** Per-process sliding window, used when Redis is absent or unreachable. */
const createMemoryLimiter = ({ windowMs, max }: RateLimitOptions) => {
  const recentByClient = new Map<string, number[]>()
  return (client: string) => {
    const now = Date.now()
    if (recentByClient.size > MEMORY_SWEEP_THRESHOLD) {
      recentByClient.forEach((times, key) => {
        if (now - times[times.length - 1] >= windowMs) recentByClient.delete(key)
      })
    }
    const recent = (recentByClient.get(client) ?? []).filter((time) => now - time < windowMs)
    if (recent.length >= max) {
      recentByClient.set(client, recent)
      return true
    }
    recentByClient.set(client, [...recent, now])
    return false
  }
}

/**
 * Returns an async check that is true once `client` has used up its `max`
 * submissions in the window. With REDIS_URL the counter is shared by every
 * instance and survives restarts (fixed window); otherwise, or whenever Redis
 * errors, it falls back to an in-process window so forms keep working.
 */
export const createRateLimiter = (options: RateLimitOptions) => {
  const memoryLimiter = createMemoryLimiter(options)
  return async (client: string): Promise<boolean> => {
    const redis = getRedis()
    if (!redis) return memoryLimiter(client)
    const window = Math.floor(Date.now() / options.windowMs)
    const key = `pel:rate:${options.name}:${client}:${window}`
    try {
      const [[, count]] = (await redis.multi().incr(key).pexpire(key, options.windowMs).exec()) as [
        [Error | null, number],
      ]
      return count > options.max
    } catch {
      return memoryLimiter(client)
    }
  }
}

/**
 * Visitor address as seen by our reverse proxy. The proxy appends the address
 * it received the request from to X-Forwarded-For, so only the last hop is
 * trustworthy: earlier ones are whatever the client chose to send.
 */
export const clientKey = async () => {
  const list = await headers()
  return (
    list.get("x-forwarded-for")?.split(",").at(-1)?.trim() || list.get("x-real-ip") || "unknown"
  )
}
