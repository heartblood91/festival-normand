import { headers } from "next/headers"

/**
 * Per-process sliding window. Good enough to stop a script flooding a public
 * form on a single server; not shared across instances.
 */
export const createRateLimiter = ({ windowMs, max }: { windowMs: number; max: number }) => {
  const recentByClient = new Map<string, number[]>()
  return (client: string) => {
    const now = Date.now()
    const recent = (recentByClient.get(client) ?? []).filter((time) => now - time < windowMs)
    if (recent.length >= max) {
      recentByClient.set(client, recent)
      return true
    }
    recentByClient.set(client, [...recent, now])
    return false
  }
}

export const clientKey = async () => {
  const list = await headers()
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "unknown"
}
