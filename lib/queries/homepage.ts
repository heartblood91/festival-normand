import { prisma } from "@/lib/prisma"

export const getFeaturedEvents = async () => {
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
}

export const getLatestNews = async () => {
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
}

export const getPartners = async () => {
  return prisma.partner.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      logo: true,
      website: true,
    },
  })
}

export const getEventCities = async () => {
  const events = await prisma.event.findMany({
    where: { published: true },
    select: { city: true },
    distinct: ["city"],
    orderBy: { city: "asc" },
  })
  return events.map((e) => e.city)
}

export type FeaturedEvent = Awaited<ReturnType<typeof getFeaturedEvents>>[number]
export type LatestNewsItem = Awaited<ReturnType<typeof getLatestNews>>[number]
export type PartnerItem = Awaited<ReturnType<typeof getPartners>>[number]
