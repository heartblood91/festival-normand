import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { localizeEntity } from "@/lib/i18n/db"
import type { Locale } from "@/lib/i18n/config"

export const getNews = async (locale: Locale = "fr") => {
  return cachedQuery(
    async () => {
      const news = await prisma.news.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          titleFr: true,
          titleEn: true,
          slug: true,
          excerptFr: true,
          excerptEn: true,
          coverImage: true,
          publishedAt: true,
        },
      })
      return news.map((n) => ({
        ...localizeEntity(n, locale, ["title", "excerpt"]),
        publishedAt: n.publishedAt?.toISOString() ?? null,
      }))
    },
    ["news-list", locale],
    { revalidate: 600, tags: ["news"] }
  )()
}

export type NewsListItem = Awaited<ReturnType<typeof getNews>>[number]

export const getNewsBySlug = async (slug: string, locale: Locale = "fr") => {
  return cachedQuery(
    async () => {
      const news = await prisma.news.findUnique({
        where: { slug, published: true },
      })
      if (!news) return null
      return {
        ...localizeEntity(news, locale, ["title", "excerpt", "content"]),
        publishedAt: news.publishedAt?.toISOString() ?? null,
        createdAt: news.createdAt.toISOString(),
        updatedAt: news.updatedAt.toISOString(),
      }
    },
    ["news-detail", slug, locale],
    { revalidate: 1800, tags: ["news"] }
  )()
}

export type NewsDetail = NonNullable<Awaited<ReturnType<typeof getNewsBySlug>>>
