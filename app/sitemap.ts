import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { publicEventWhere } from "@/lib/queries/visibility"
import { locales } from "@/lib/i18n/config"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

// Without this the sitemap is rendered once at build time: a build against an
// empty or unreachable DB ships a sitemap with no event at all (seen in prod).
export const revalidate = 3600

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const [events, news, pages, galleryYears] = await Promise.all([
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
  ])

  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    entries.push(
      {
        url: `${BASE_URL}/${locale}`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: `${BASE_URL}/${locale}/evenements`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: `${BASE_URL}/${locale}/actualites`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.8,
      },
      {
        url: `${BASE_URL}/${locale}/contact`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      }
    )

    // The latest year lives at /retour-en-images; older ones under their year.
    galleryYears.forEach(({ year }, index) =>
      entries.push({
        url: `${BASE_URL}/${locale}/retour-en-images${index === 0 ? "" : `/${year}`}`,
        changeFrequency: "monthly",
        priority: 0.6,
      })
    )

    for (const page of pages) {
      entries.push({
        url: `${BASE_URL}/${locale}/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })
    }

    for (const event of events) {
      entries.push({
        url: `${BASE_URL}/${locale}/evenement/${event.slug}`,
        lastModified: event.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })
    }

    for (const article of news) {
      entries.push({
        url: `${BASE_URL}/${locale}/actualite/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })
    }
  }

  return entries
}

export default sitemap
