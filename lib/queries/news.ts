import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const getNews = async () => {
  return unstable_cache(
    async () => {
      return prisma.news.findMany({
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
    },
    ["news-list"],
    { revalidate: 600, tags: ["news"] }
  )()
}

export type NewsListItem = Awaited<ReturnType<typeof getNews>>[number]

export const getNewsBySlug = async (slug: string) => {
  return unstable_cache(
    async () => {
      return prisma.news.findUnique({
        where: { slug, published: true },
      })
    },
    ["news-detail", slug],
    { revalidate: 1800, tags: ["news"] }
  )()
}

export type NewsDetail = NonNullable<Awaited<ReturnType<typeof getNewsBySlug>>>
