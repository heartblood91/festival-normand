"use server"

import { prisma } from "@/lib/prisma"
import { publicEventWhere } from "@/lib/queries/visibility"
import { getTravelBookEvents } from "@/lib/queries/travel-book"
import { normalizeEventIds } from "@/lib/travel-book/favorites"
import { travelBookKey } from "@/lib/travel-book/key"
import { defaultLocale, locales, type Locale } from "@/lib/i18n/config"

// Public visitor actions (no login): they only read published events and store
// lists of public event ids, so no requireRole guard applies here.

const toLocale = (value: unknown): Locale =>
  locales.includes(value as Locale) ? (value as Locale) : defaultLocale

export const loadTravelBook = async (ids: unknown, locale: unknown) =>
  Array.isArray(ids) ? getTravelBookEvents(ids, toLocale(locale)) : []

export const shareTravelBook = async (
  ids: unknown
): Promise<{ success: true; id: string } | { success: false }> => {
  if (!Array.isArray(ids)) return { success: false }
  const requested = normalizeEventIds(ids)
  if (requested.length === 0) return { success: false }

  try {
    const events = await prisma.event.findMany({
      where: { ...(await publicEventWhere()), id: { in: requested } },
      select: { id: true },
    })
    const eventIds = normalizeEventIds(events.map((event) => event.id))
    if (eventIds.length === 0) return { success: false }

    const key = travelBookKey(eventIds)
    const book = await prisma.travelBook.upsert({
      where: { key },
      create: { key, eventIds },
      update: {},
      select: { id: true },
    })
    return { success: true, id: book.id }
  } catch {
    return { success: false }
  }
}
