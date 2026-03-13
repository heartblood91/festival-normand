import { prisma } from "@/lib/prisma"

export const getNews = async () => {
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
}

export type NewsListItem = Awaited<ReturnType<typeof getNews>>[number]

export const getNewsBySlug = async (slug: string) => {
  return prisma.news.findUnique({
    where: { slug, published: true },
  })
}

export type NewsDetail = NonNullable<Awaited<ReturnType<typeof getNewsBySlug>>>
