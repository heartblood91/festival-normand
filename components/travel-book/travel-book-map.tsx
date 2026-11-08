"use client"

import { useTranslations } from "next-intl"
import { EventsMapWrapper } from "@/components/events/events-map-wrapper"
import { isInNormandyBounds } from "@/lib/geo/normandy"
import type { TravelBookEvent } from "@/lib/queries/travel-book"

export const TravelBookMap = ({ events }: { events: TravelBookEvent[] }) => {
  const t = useTranslations("travelBook")
  const located = events.filter(isInNormandyBounds)
  if (located.length === 0) return null

  // A canvas map does not print reliably: the printed page keeps the list only.
  return (
    <section aria-label={t("mapTitle")} className="print:hidden">
      <EventsMapWrapper events={located} />
    </section>
  )
}
