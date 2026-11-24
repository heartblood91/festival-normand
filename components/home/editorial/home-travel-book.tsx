"use client"

import { useEffect, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Link } from "@/lib/i18n/routing"
import { loadTravelBook } from "@/lib/actions/travel-book"
import { useFavorites } from "@/lib/travel-book/use-favorites"
import { formatEventDate } from "@/lib/utils/format-date"
import { SectionHeading } from "@/components/editorial/primitives"
import { EventThumb } from "@/components/editorial/event-thumb"
import type { TravelBookEvent } from "@/lib/queries/travel-book"

const PREVIEW_COUNT = 4

/**
 * Home reminder of the visitor's own picks; renders nothing until they bookmark a place.
 * Unnumbered: it only shows after hydration, so it must not shift the server-rendered ¶ NN.
 */
export const HomeTravelBook = () => {
  const t = useTranslations()
  const locale = useLocale()
  const { ids } = useFavorites()
  const [loaded, setLoaded] = useState<{ key: string; events: TravelBookEvent[] } | null>(null)
  const key = ids.join(",")

  useEffect(() => {
    if (ids.length === 0) return
    let cancelled = false
    loadTravelBook(ids, locale)
      .catch(() => [])
      .then((events) => {
        if (!cancelled) setLoaded({ key, events })
      })
    return () => {
      cancelled = true
    }
  }, [ids, key, locale])

  const events = loaded ? loaded.events.filter((event) => ids.includes(event.id)) : []
  if (events.length === 0) return null
  const preview = events.slice(0, PREVIEW_COUNT)
  const more = events.length - preview.length

  return (
    <section
      data-testid="home-travel-book"
      className="bg-ed-bg-soft border-primary/25 border-t px-4 py-16 md:px-6 md:py-20"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          marker={t("travelBook.homeMarker")}
          title={t("travelBook.homeTitle")}
          action={
            <Link
              href="/carnet"
              className="text-primary hover:text-ed-amber-soft focus-visible:ring-primary/50 border-primary inline-flex items-center rounded-sm border-b pb-1 font-sans text-xs tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("travelBook.openMine")}
            </Link>
          }
        />
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {preview.map((event) => (
            <li key={event.id}>
              <Link
                href={`/evenement/${event.slug}`}
                className="border-primary/15 hover:border-primary/50 focus-visible:ring-primary/50 flex items-center gap-4 border p-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                <EventThumb
                  coverImage={event.coverImage}
                  category={event.category}
                  title={event.title}
                  seed={event.slug}
                  sizes="64px"
                  className="aspect-square w-16 shrink-0"
                />
                <span className="min-w-0">
                  <span className="text-foreground font-display block truncate text-lg">
                    {event.title}
                  </span>
                  <span className="text-ed-bone block truncate font-serif text-sm italic opacity-85">
                    {[event.city, event.dateStart ? formatEventDate(event.dateStart, locale) : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
        {more > 0 ? (
          <p className="text-ed-bone mt-4 font-serif text-sm italic">
            {t("travelBook.homeMore", { count: more })}
          </p>
        ) : null}
      </div>
    </section>
  )
}
