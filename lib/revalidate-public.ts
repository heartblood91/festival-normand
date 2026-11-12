import { revalidatePath } from "next/cache"
import { locales } from "@/lib/i18n/config"

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
