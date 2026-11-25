import type { MetadataRoute } from "next"
import { connection } from "next/server"
import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { publicEventWhere } from "@/lib/queries/visibility"
import { defaultLocale, locales } from "@/lib/i18n/config"
import { getCurrentEdition } from "@/lib/queries/edition"
import { getActiveThemeSlugs } from "@/lib/queries/themes"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

// Rendered per request (never at build: no database then) on top of a data
// cache shared through the ISR cache handler. revalidatePublic() refreshes it
// through the /sitemap.xml path tag; the hourly expiry catches the rest.
const getSitemapData = cachedQuery(
  async () =>
    Promise.all([
      prisma.event.findMany({
        where: await publicEventWhere(),
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.news.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.page.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.galleryPhoto.groupBy({
        by: ["year"],
        where: { altFr: { not: "" } },
        orderBy: { year: "desc" },
      }),
    ]),
  ["sitemap-data"],
  { revalidate: 3600, tags: ["sitemap", "events", "news", "pages", "gallery"] }
)

// Theme pages exist only while their theme is shown, so they follow the edition year.
const getSitemapThemes = (year: number) =>
  cachedQuery(() => getActiveThemeSlugs(year), ["sitemap-themes", String(year)], {
    revalidate: 3600,
    tags: ["sitemap", "themes"],
  })()

type Route = Omit<MetadataRoute.Sitemap[number], "url" | "alternates"> & { path: string }

// One entry per locale, each pointing at its translations (hreflang) and x-default.
const localized = ({ path, ...rest }: Route): MetadataRoute.Sitemap => {
  const languages = Object.fromEntries(
    locales.map((locale) => [locale, `${BASE_URL}/${locale}${path}`])
  )
  const alternates = {
    languages: { ...languages, "x-default": `${BASE_URL}/${defaultLocale}${path}` },
  }
  return locales.map((locale) => ({ url: `${BASE_URL}/${locale}${path}`, alternates, ...rest }))
}

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  await connection()
  const { year } = await getCurrentEdition()
  const [[events, news, pages, galleryYears], themes] = await Promise.all([
    getSitemapData(),
    getSitemapThemes(year),
  ])

  // Listing pages change with their content: date them by their newest item.
  // Dates come back as strings from the shared cache, hence new Date().
  const latestEvent = events[0] ? new Date(events[0].updatedAt) : undefined
  const latestNews = news[0] ? new Date(news[0].updatedAt) : undefined
  const latest = [latestEvent, latestNews]
    .filter((date): date is Date => date !== undefined)
    .sort((a, b) => b.getTime() - a.getTime())[0]

  const routes: Route[] = [
    { path: "", lastModified: latest, changeFrequency: "daily", priority: 1 },
    { path: "/evenements", lastModified: latestEvent, changeFrequency: "daily", priority: 0.9 },
    { path: "/actualites", lastModified: latestNews, changeFrequency: "daily", priority: 0.8 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    // The latest year lives at /retour-en-images; older ones under their year.
    ...galleryYears.map(({ year }, index) => ({
      path: `/retour-en-images${index === 0 ? "" : `/${year}`}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...pages.map((page) => ({
      path: `/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...themes.map((theme) => ({
      path: `/thematique/${theme.slug}`,
      lastModified: new Date(theme.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...events.map((event) => ({
      path: `/evenement/${event.slug}`,
      lastModified: new Date(event.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...news.map((article) => ({
      path: `/actualite/${article.slug}`,
      lastModified: new Date(article.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ]

  return routes.flatMap(localized)
}

export default sitemap
