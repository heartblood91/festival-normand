import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { publicEventWhere } from "@/lib/queries/visibility"
import { EVENT_LIST_SELECT } from "@/lib/queries/events"
import { localizeEntity } from "@/lib/i18n/db"
import { editionYearRange, type Edition } from "@/lib/festival/edition"
import { getCurrentEdition } from "@/lib/queries/edition"
import { activeThemeWhere } from "@/lib/themes/active"
import type { Locale } from "@/lib/i18n/config"

const THEME_ORDER = [{ order: "asc" as const }, { nameFr: "asc" as const }]

/** Theme chips of the public filter: only themes with a visible event. */
export const getFilterThemes = async (locale: Locale = "fr") => {
  const { year } = await getCurrentEdition()
  return cachedQuery(
    async () => {
      const themes = await prisma.theme.findMany({
        where: activeThemeWhere(year),
        orderBy: THEME_ORDER,
        select: {
          slug: true,
          nameFr: true,
          nameEn: true,
          color: true,
          _count: { select: { events: { where: await publicEventWhere() } } },
        },
      })
      return themes
        .filter((theme) => theme._count.events > 0)
        .map((theme) => ({
          slug: theme.slug,
          name: localizeEntity(theme, locale, ["name"]).name,
          color: theme.color,
          count: theme._count.events,
        }))
    },
    ["filter-themes", locale, String(year)],
    { revalidate: 300, tags: ["events", "themes"] }
  )()
}

export type FilterTheme = Awaited<ReturnType<typeof getFilterThemes>>[number]

/** Themes flagged for the home page with a few events of the edition; themes without any are left out. */
export const getHomeThemes = async (locale: Locale = "fr", edition: Edition) =>
  cachedQuery(
    async () => {
      const themes = await prisma.theme.findMany({
        where: { showOnHome: true, ...activeThemeWhere(edition.year) },
        orderBy: THEME_ORDER,
        select: {
          id: true,
          slug: true,
          nameFr: true,
          nameEn: true,
          descriptionFr: true,
          descriptionEn: true,
          color: true,
          markerImage: true,
          events: {
            where: { ...(await publicEventWhere()), dateStart: editionYearRange(edition) },
            orderBy: [{ dateStart: "asc" }, { id: "asc" }],
            take: 3,
            select: {
              id: true,
              titleFr: true,
              titleEn: true,
              slug: true,
              city: true,
              dateStart: true,
            },
          },
        },
      })
      return themes
        .filter((theme) => theme.events.length > 0)
        .map((theme) => ({
          ...localizeEntity(theme, locale, ["name", "description"]),
          events: theme.events.map((event) => ({
            ...localizeEntity(event, locale, ["title"]),
            dateStart: event.dateStart.toISOString(),
          })),
        }))
    },
    ["home-themes", locale, String(edition.year)],
    { revalidate: 300, tags: ["events", "themes"] }
  )()

export type HomeTheme = Awaited<ReturnType<typeof getHomeThemes>>[number]

export const THEME_PAGE_EVENTS = 24

/**
 * Public page of a theme (/thematique/[slug]): null unless the theme is shown for the
 * edition, so a theme outside its years has no page. Lists its public events of the edition.
 */
export const getThemePage = async (slug: string, locale: Locale, edition: Edition) =>
  cachedQuery(
    async () => {
      const eventsWhere = {
        ...(await publicEventWhere()),
        dateStart: editionYearRange(edition),
      }
      const theme = await prisma.theme.findFirst({
        where: { slug, ...activeThemeWhere(edition.year) },
        select: {
          slug: true,
          nameFr: true,
          nameEn: true,
          descriptionFr: true,
          descriptionEn: true,
          coverImage: true,
          updatedAt: true,
          events: {
            where: eventsWhere,
            orderBy: [{ dateStart: "asc" }, { id: "asc" }],
            take: THEME_PAGE_EVENTS,
            select: EVENT_LIST_SELECT,
          },
          _count: { select: { events: { where: eventsWhere } } },
        },
      })
      if (!theme) return null
      const { events, _count, ...rest } = theme
      return {
        ...localizeEntity(rest, locale, ["name", "description"]),
        updatedAt: rest.updatedAt.toISOString(),
        eventCount: _count.events,
        events: events.map((event) => ({
          ...localizeEntity(event, locale, ["title", "coverImageAlt"]),
          dateStart: event.dateStart?.toISOString() ?? null,
          dateEnd: event.dateEnd?.toISOString() ?? null,
        })),
      }
    },
    ["theme-page", slug, locale, String(edition.year)],
    { revalidate: 300, tags: ["events", "themes"] }
  )()

export type ThemePage = NonNullable<Awaited<ReturnType<typeof getThemePage>>>

/** Slugs of the themes that have a public page this edition (sitemap). */
export const getActiveThemeSlugs = async (year: number) =>
  prisma.theme.findMany({
    where: activeThemeWhere(year),
    orderBy: THEME_ORDER,
    select: { slug: true, updatedAt: true },
  })
