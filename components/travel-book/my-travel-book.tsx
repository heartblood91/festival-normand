"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import { useLocale, useTranslations } from "next-intl"
import { BookOpen } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { loadTravelBook } from "@/lib/actions/travel-book"
import { useFavorites } from "@/lib/travel-book/use-favorites"
import { TravelBookList } from "@/components/travel-book/travel-book-list"
import { TravelBookMap } from "@/components/travel-book/travel-book-map"
import { PrintButton, ShareTravelBook } from "@/components/travel-book/travel-book-actions"
import type { TravelBookEvent } from "@/lib/queries/travel-book"

const noop = () => () => {}

/** The visitor's own travel book, read from this browser's storage. */
export const MyTravelBook = () => {
  const t = useTranslations()
  const locale = useLocale()
  const { ids, toggle } = useFavorites()
  // False during SSR and hydration: storage can only be read in the browser.
  const hydrated = useSyncExternalStore(
    noop,
    () => true,
    () => false
  )
  const [loaded, setLoaded] = useState<{ key: string; events: TravelBookEvent[] } | null>(null)
  const key = ids.join(",")

  useEffect(() => {
    if (!hydrated || ids.length === 0) return
    let cancelled = false
    loadTravelBook(ids, locale).then((events) => {
      if (!cancelled) setLoaded({ key, events })
    })
    return () => {
      cancelled = true
    }
  }, [hydrated, ids, key, locale])

  if (hydrated && ids.length === 0) {
    return (
      <div className="border-primary/20 bg-ed-bg-soft flex flex-col items-center border px-6 py-16 text-center">
        <BookOpen className="text-primary/70 mb-5 size-12" strokeWidth={1.25} aria-hidden="true" />
        <p className="text-foreground font-display text-2xl italic">{t("travelBook.empty")}</p>
        <p className="text-ed-bone mt-2 font-serif">{t("travelBook.emptyHint")}</p>
        <Link
          href="/evenements"
          className="bg-primary text-primary-foreground hover:bg-ed-amber-deep focus-visible:ring-ring mt-6 inline-flex min-h-11 items-center px-5 font-sans text-xs font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {t("travelBook.browse")}
        </Link>
      </div>
    )
  }

  // Keep showing the previous list while a removal reloads, minus the removed events.
  const events = loaded ? loaded.events.filter((event) => ids.includes(event.id)) : null
  if (!events) {
    return (
      <p role="status" className="text-ed-bone font-serif italic">
        {t("travelBook.loading")}
      </p>
    )
  }

  const missing = loaded?.key === key ? ids.length - events.length : 0

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between print:hidden">
        <p className="text-ed-bone font-serif" aria-live="polite">
          {t("travelBook.count", { count: events.length })}
          {missing > 0 ? ` — ${t("travelBook.unavailable", { count: missing })}` : ""}
        </p>
        <div className="flex flex-col gap-3 md:items-end">
          <PrintButton />
          <ShareTravelBook eventIds={events.map((event) => event.id)} />
        </div>
      </div>
      <TravelBookMap events={events} />
      <TravelBookList events={events} onRemove={toggle} />
    </div>
  )
}
