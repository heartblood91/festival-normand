import { revalidatePath, updateTag } from "next/cache"
import { locales } from "@/lib/i18n/config"

/**
 * Tags of the cachedQuery() data. An ISR page carries the tags of the data it
 * rendered, so expiring a tag also expires every event or news page built from it.
 */
export type PublicCacheTag =
  | "edition"
  | "events"
  | "themes"
  | "news"
  | "pages"
  | "partners"
  | "gallery"
  | "reviews"
  | "surveys"
  | "sitemap"
  | "settings"

/**
 * Public URLs always carry a locale (/fr/…, /en/…): a path without it matches
 * no cached page, so an admin change would stay hidden until the cache expires.
 */
export const revalidatePublic = (...paths: string[]) => {
  paths.forEach((path) =>
    locales.forEach((locale) => revalidatePath(path === "/" ? `/${locale}` : `/${locale}${path}`))
  )
  // Any public change can add or remove a URL: refresh the sitemap now rather than within the hour.
  revalidatePath("/sitemap.xml")
}

/**
 * Server actions only. A path only reaches the shared data read on that page:
 * an edited event also shows on the map, the themes, the travel book and its
 * neighbours' pages, so admin changes expire the data tags too.
 */
export const expirePublicData = (...tags: PublicCacheTag[]) => {
  tags.forEach((tag) => updateTag(tag))
}

type IncrementalCache = { revalidateTag: (tags: string[]) => Promise<void> }

/**
 * Outside a server action (the Tourinsoft scheduler runs on a timer, the cron
 * in a route handler), updateTag() is unavailable. Next keeps its incremental
 * cache on globalThis from the first request on; without a duration its
 * revalidateTag() expires the tags in the cache handler (Redis and local) at once.
 * Returns false when no request has reached this process yet. Checked against
 * Next 16.1 (base-server.js, incremental-cache/index.js): re-check on upgrades.
 */
export const expirePublicDataNow = async (...tags: PublicCacheTag[]): Promise<boolean> => {
  const cache = (globalThis as { __incrementalCache?: IncrementalCache }).__incrementalCache
  if (!cache) return false
  await cache.revalidateTag(tags)
  return true
}
