import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const getFeaturedEvents = async () => {
  return unstable_cache(
    async () => {
      return prisma.event.findMany({
        where: {
          published: true,
          featured: true,
        },
        orderBy: { dateStart: "asc" },
        take: 3,
        select: {
          id: true,
          title: true,
          slug: true,
          location: true,
          city: true,
          department: true,
          category: true,
          dateStart: true,
          timeStart: true,
          timeEnd: true,
          coverImage: true,
        },
      })
    },
    ["featured-events"],
    { revalidate: 300, tags: ["events"] }
  )()
}

export const getLatestNews = async () => {
  return unstable_cache(
    async () => {
      return prisma.news.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 6,
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
    ["latest-news"],
    { revalidate: 600, tags: ["news"] }
  )()
}

export const getPartners = async () => {
  return unstable_cache(
    async () => {
      return prisma.partner.findMany({
        orderBy: { order: "asc" },
        select: {
          id: true,
          name: true,
          logo: true,
          website: true,
        },
      })
    },
    ["partners"],
    { revalidate: 86400, tags: ["partners"] }
  )()
}

export const getEventCities = async () => {
  return unstable_cache(
    async () => {
      const events = await prisma.event.findMany({
        where: { published: true },
        select: { city: true },
        distinct: ["city"],
        orderBy: { city: "asc" },
      })
      return events.map((e) => e.city)
    },
    ["event-cities"],
    { revalidate: 3600, tags: ["events"] }
  )()
}

export type FeaturedEvent = Awaited<ReturnType<typeof getFeaturedEvents>>[number]
export type LatestNewsItem = Awaited<ReturnType<typeof getLatestNews>>[number]
export type PartnerItem = Awaited<ReturnType<typeof getPartners>>[number]
