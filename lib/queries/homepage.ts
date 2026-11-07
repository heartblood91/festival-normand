import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { publicEventWhere } from "@/lib/queries/visibility"
import { localizeEntity } from "@/lib/i18n/db"
import { editionYearRange, type Edition } from "@/lib/festival/edition"
import type { Locale } from "@/lib/i18n/config"

// Home sections only show the current edition: last year's picks must not
// pass for the upcoming programme.
export const getFeaturedEvents = async (locale: Locale = "fr", edition?: Edition) => {
  return cachedQuery(
    async () => {
      const events = await prisma.event.findMany({
        where: {
          ...(await publicEventWhere()),
          featured: true,
          ...(edition ? { dateStart: editionYearRange(edition) } : {}),
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
          dateEnd: true,
          timeStart: true,
          timeEnd: true,
          pricingFr: true,
          pricingEn: true,
          coverImage: true,
          coverImageAltFr: true,
          coverImageAltEn: true,
        },
      })
      return events.map((e) => ({
        ...localizeEntity(e, locale, ["title", "pricing", "coverImageAlt"]),
        dateStart: e.dateStart?.toISOString() ?? null,
        dateEnd: e.dateEnd?.toISOString() ?? null,
      }))
    },
    ["featured-events", locale, "v3", String(edition?.year ?? "all")],
    { revalidate: 300, tags: ["events"] }
  )()
}

/** Sample of the programme shown as a teaser on the upcoming home. */
export const getProgrammeTeaser = async (locale: Locale = "fr", edition: Edition) => {
  return cachedQuery(
    async () => {
      const events = await prisma.event.findMany({
        where: { ...(await publicEventWhere()), dateStart: editionYearRange(edition) },
        orderBy: { dateStart: "asc" },
        take: 6,
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
          pricingFr: true,
          pricingEn: true,
          coverImage: true,
          coverImageAltFr: true,
          coverImageAltEn: true,
        },
      })
      return events.map((e) => ({
        ...localizeEntity(e, locale, ["title", "pricing", "coverImageAlt"]),
        dateStart: e.dateStart?.toISOString() ?? null,
      }))
    },
    ["programme-teaser", locale, String(edition.year)],
    { revalidate: 300, tags: ["events"] }
  )()
}

/** Headline numbers + per-department / per-night counts of the edition. */
export const getHomeStats = async (edition: Edition) => {
  return cachedQuery(
    async () => {
      const nightRanges = edition.nights.map((n) => {
        const start = new Date(`${n.date}T00:00:00`)
        const end = new Date(start.getTime() + 24 * 60 * 60 * 1000)
        return { code: n.code, start, end }
      })

      const visible = { ...(await publicEventWhere()), dateStart: editionYearRange(edition) }
      const [total, grouped, ...nightCounts] = await Promise.all([
        prisma.event.count({ where: visible }),
        prisma.event.groupBy({
          by: ["department"],
          where: visible,
          _count: { _all: true },
        }),
        ...nightRanges.map((r) =>
          prisma.event.count({
            where: { ...visible, dateStart: { gte: r.start, lt: r.end } },
          })
        ),
      ])

      const byDepartment: Record<string, number> = {}
      for (const row of grouped) byDepartment[row.department] = row._count._all
      const byNight: Record<string, number> = {}
      nightRanges.forEach((r, i) => {
        byNight[r.code] = nightCounts[i]
      })

      return { totalPlaces: total, byDepartment, byNight }
    },
    ["home-stats", "v3", edition.nights.map((night) => night.date).join(",")],
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
          coverImageAltFr: true,
          coverImageAltEn: true,
          publishedAt: true,
        },
      })
      return news.map((n) => ({
        ...localizeEntity(n, locale, ["title", "excerpt", "coverImageAlt"]),
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
    ["partners", locale, "v2"],
    { revalidate: 300, tags: ["partners"] }
  )()
}

export const getEventCities = async () => {
  return cachedQuery(
    async () => {
      const events = await prisma.event.findMany({
        where: await publicEventWhere(),
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
export type ProgrammeTeaserEvent = Awaited<ReturnType<typeof getProgrammeTeaser>>[number]
export type LatestNewsItem = Awaited<ReturnType<typeof getLatestNews>>[number]
export type PartnerItem = Awaited<ReturnType<typeof getPartners>>[number]
export type HomeStats = Awaited<ReturnType<typeof getHomeStats>>
