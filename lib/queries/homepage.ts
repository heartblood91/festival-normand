import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { localizeEntity } from "@/lib/i18n/db"
import type { Locale } from "@/lib/i18n/config"

export const getFeaturedEvents = async (locale: Locale = "fr") => {
  return cachedQuery(
    async () => {
      const events = await prisma.event.findMany({
        where: {
          published: true,
          featured: true,
        },
        orderBy: { dateStart: "asc" },
        take: 3,
        select: {
          id: true,
          titleFr: true,
          titleEn: true,
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
      return events.map((e) => ({
        ...localizeEntity(e, locale, ["title"]),
        dateStart: e.dateStart?.toISOString() ?? null,
      }))
    },
    ["featured-events", locale],
    { revalidate: 300, tags: ["events"] }
  )()
}

export const getLatestNews = async (locale: Locale = "fr") => {
  return cachedQuery(
    async () => {
      const news = await prisma.news.findMany({
        where: { published: true },
        orderBy: { publishedAt: "desc" },
        take: 6,
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
    ["latest-news", locale],
    { revalidate: 600, tags: ["news"] }
  )()
}

export const getPartners = async (locale: Locale = "fr") => {
  return cachedQuery(
    async () => {
      const partners = await prisma.partner.findMany({
        orderBy: { order: "asc" },
        select: {
          id: true,
          nameFr: true,
          nameEn: true,
          logo: true,
          website: true,
        },
      })
      return partners.map((p) => ({
        ...localizeEntity(p, locale, ["name"]),
        logo: p.logo,
        website: p.website,
      }))
    },
    ["partners", locale],
    { revalidate: 86400, tags: ["partners"] }
  )()
}

export const getEventCities = async () => {
  return cachedQuery(
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
