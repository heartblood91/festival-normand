import { unstable_cache } from "next/cache"

/**
 * Wrapper around unstable_cache that bypasses caching in development.
 * In production, behaves exactly like unstable_cache.
 * In development, executes the callback directly (no cache).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const cachedQuery: typeof unstable_cache = (fn: any, keyParts?: string[], options?: any) => {
  if (process.env.NODE_ENV === "development") {
    return fn
  }
  return unstable_cache(fn, keyParts, options)
}
