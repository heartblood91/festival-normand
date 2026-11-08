import { prisma } from "@/lib/prisma"
import { publicEventWhere } from "@/lib/queries/visibility"
import { EVENT_LIST_SELECT } from "@/lib/queries/events"
import { localizeEntity } from "@/lib/i18n/db"
import { themePin } from "@/lib/themes/marker"
import { normalizeEventIds } from "@/lib/travel-book/favorites"
import type { Locale } from "@/lib/i18n/config"

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Public events of a travel book; unpublished or unknown ids drop out silently. */
export const getTravelBookEvents = async (ids: unknown[], locale: Locale) => {
  const eventIds = normalizeEventIds(ids)
  if (eventIds.length === 0) return []

  const events = await prisma.event.findMany({
    where: { ...(await publicEventWhere()), id: { in: eventIds } },
    orderBy: [{ dateStart: "asc" }, { id: "asc" }],
    select: {
      ...EVENT_LIST_SELECT,
      themes: { select: { order: true, color: true, markerImage: true } },
    },
  })

  return events.map(({ themes, ...event }) => ({
    ...localizeEntity(event, locale, ["title", "coverImageAlt"]),
    dateStart: event.dateStart?.toISOString() ?? null,
    dateEnd: event.dateEnd?.toISOString() ?? null,
    pin: themePin(themes),
  }))
}

export type TravelBookEvent = Awaited<ReturnType<typeof getTravelBookEvents>>[number]

export const getTravelBook = async (id: string) => {
  if (!UUID_PATTERN.test(id)) return null
  return prisma.travelBook.findUnique({ where: { id }, select: { id: true, eventIds: true } })
}
