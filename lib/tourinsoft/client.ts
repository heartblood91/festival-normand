import type { TourinsoftOffer, TourinsoftSyndication } from "./types"

const MAX_RETRIES = 3
const DEFAULT_RETRY_AFTER_MS = 30_000
const REQUEST_TIMEOUT_MS = 60_000

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

// The V3 feed is served from a cache (TTL 2h–24h). A 429 means the cache is being
// recomputed: honour Retry-After and retry rather than failing the whole sync.
export const fetchSyndication = async (): Promise<TourinsoftOffer[]> => {
  const url = process.env.TOURINSOFT_SYNDICATION_URL
  if (!url) {
    throw new Error("TOURINSOFT_SYNDICATION_URL is not set")
  }

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

    try {
      const response = await fetch(url, { signal: controller.signal })

      if (response.status === 429 && attempt < MAX_RETRIES) {
        const retryAfter = Number(response.headers.get("retry-after"))
        const waitMs =
          Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : DEFAULT_RETRY_AFTER_MS
        await sleep(waitMs)
        continue
      }

      if (!response.ok) {
        throw new Error(`Tourinsoft syndication error: ${response.status}`)
      }

      const data = (await response.json()) as TourinsoftSyndication
      return data.value ?? []
    } finally {
      clearTimeout(timeout)
    }
  }

  throw new Error("Tourinsoft syndication unavailable after retries")
}
