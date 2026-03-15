import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const getNews = async () => {
  return unstable_cache(
    async () => {
      const news = await prisma.news.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          publishedAt: true,
        },
      })
      return news.map((n) => ({
        ...n,
        publishedAt: n.publishedAt?.toISOString() ?? null,
      }))
    },
    ["news-list"],
    { revalidate: 600, tags: ["news"] }
  )()
}

export type NewsListItem = Awaited<ReturnType<typeof getNews>>[number]

export const getNewsBySlug = async (slug: string) => {
  return unstable_cache(
    async () => {
      const news = await prisma.news.findUnique({
        where: { slug, published: true },
      })
      if (!news) return null
      return {
        ...news,
        publishedAt: news.publishedAt?.toISOString() ?? null,
        createdAt: news.createdAt.toISOString(),
        updatedAt: news.updatedAt.toISOString(),
      }
    },
    ["news-detail", slug],
    { revalidate: 1800, tags: ["news"] }
  )()
}

export type NewsDetail = NonNullable<Awaited<ReturnType<typeof getNewsBySlug>>>
