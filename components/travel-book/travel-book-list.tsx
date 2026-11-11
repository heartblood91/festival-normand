"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Clock, MapPin, X } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { cn } from "@/lib/utils"
import { formatEventDateRange, formatTime } from "@/lib/utils/format-date"
import { groupTravelBook, type TravelBookGrouping } from "@/lib/travel-book/favorites"
import type { TravelBookEvent } from "@/lib/queries/travel-book"

type TravelBookListProps = {
  events: TravelBookEvent[]
  /** Called with an event id; absent on a shared, read-only travel book. */
  onRemove?: (id: string) => void
}

const GROUPINGS: TravelBookGrouping[] = ["date", "place"]

export const TravelBookList = ({ events, onRemove }: TravelBookListProps) => {
  const t = useTranslations()
  const locale = useLocale()
  const [grouping, setGrouping] = useState<TravelBookGrouping>("date")
  const groups = groupTravelBook(events, grouping, locale)

  return (
    <div>
      <div
        role="group"
        aria-label={t("travelBook.groupBy")}
        className="mb-6 flex flex-wrap items-center gap-2 print:hidden"
      >
        <span className="text-ed-mute mr-1 font-mono text-xs tracking-[0.16em] uppercase">
          {t("travelBook.groupBy")}
        </span>
        {GROUPINGS.map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={grouping === value}
            onClick={() => setGrouping(value)}
            className={cn(
              "focus-visible:ring-primary/50 min-h-11 border px-4 font-sans text-xs tracking-[0.12em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none",
              grouping === value
                ? "bg-primary text-primary-foreground border-primary"
                : "border-primary/40 text-ed-bone hover:border-primary"
            )}
          >
            {t(value === "date" ? "travelBook.byDate" : "travelBook.byPlace")}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-10">
        {groups.map((group, index) => (
          <section key={group.key || "unknown"} aria-labelledby={`tb-group-${index}`}>
            <h2
              id={`tb-group-${index}`}
              className="text-primary border-primary/25 font-display mb-4 border-b pb-2 text-2xl font-normal italic first-letter:uppercase"
            >
              {group.label ??
                t(grouping === "date" ? "travelBook.unknownDate" : "travelBook.unknownPlace")}
            </h2>
            <ol className="flex flex-col gap-3">
              {group.events.map((event) => (
                <li
                  key={event.id}
                  className="bg-ed-bg-soft border-primary/20 flex break-inside-avoid items-start gap-3 border p-4"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/evenement/${event.slug}`}
                      className="text-foreground hover:text-primary focus-visible:ring-primary/50 font-display text-xl leading-snug break-words focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {event.title}
                    </Link>
                    <p className="text-ed-bone mt-1 flex items-start gap-1.5 font-serif text-sm italic">
                      <MapPin
                        className="text-primary mt-0.5 size-3.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>
                        {event.location}
                        {event.city ? `, ${event.city}` : ""}
                      </span>
                    </p>
                    {event.dateStart ? (
                      <p className="text-ed-mute mt-1 flex items-center gap-1.5 font-mono text-xs tracking-[0.12em] uppercase">
                        <Clock className="text-primary size-3.5 shrink-0" aria-hidden="true" />
                        <span>
                          {formatEventDateRange(event.dateStart, event.dateEnd, locale)}
                          {formatTime(event.timeStart ?? undefined)
                            ? ` · ${formatTime(event.timeStart ?? undefined)}`
                            : ""}
                        </span>
                      </p>
                    ) : null}
                  </div>
                  {onRemove ? (
                    <button
                      type="button"
                      onClick={() => onRemove(event.id)}
                      aria-label={t("travelBook.removeNamed", { title: event.title })}
                      className="text-ed-bone hover:text-primary focus-visible:ring-primary/50 inline-flex size-11 shrink-0 items-center justify-center transition-colors focus-visible:ring-2 focus-visible:outline-none print:hidden"
                    >
                      <X className="size-4" aria-hidden="true" />
                    </button>
                  ) : null}
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </div>
  )
}
