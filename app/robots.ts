import type { MetadataRoute } from "next"
import { locales } from "@/lib/i18n/config"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      userAgent: "*",
      allow: "/",
      // Every URL carries its locale prefix, admin included.
      disallow: ["/admin/", "/api/", ...locales.map((locale) => `/${locale}/admin/`)],
    },
  ],
  sitemap: `${BASE_URL}/sitemap.xml`,
})

export default robots
