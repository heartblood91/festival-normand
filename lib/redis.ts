import { Redis } from "ioredis"

let client: Redis | null | undefined

/**
 * Shared Redis client, or null when REDIS_URL is not set. Redis is optional:
 * commands fail fast while it is unreachable (no offline queue) so callers can
 * fall back to in-process state instead of hanging a visitor's request.
 */
export const getRedis = (): Redis | null => {
  if (client !== undefined) return client
  const url = process.env.REDIS_URL
  if (!url) return (client = null)

  client = new Redis(url, {
    connectTimeout: 1_000,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 0,
    // Keep reconnecting in the background, at most every 10 s.
    retryStrategy: (attempt) => Math.min(attempt * 500, 10_000),
  })
  // Without a listener ioredis logs every failed reconnect as an unhandled error.
  client.on("error", () => {})
  return client
}
