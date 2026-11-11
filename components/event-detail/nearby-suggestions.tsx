import { getTranslations } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import { formatEventDateRange } from "@/lib/utils/format-date"
import { NEARBY_SUGGESTION_RADIUS_KM } from "@/lib/events/nearby"
import type { NeighbourEvent } from "@/lib/queries/events"

type NearbySuggestionsProps = {
  items: NeighbourEvent[]
  sameDay: boolean
  locale: string
}

// Readable counterpart of the map: same numbers as the map markers.
const NearbySuggestions = async ({ items, sameDay, locale }: NearbySuggestionsProps) => {
  const t = await getTranslations()

  if (items.length === 0) return null

  return (
    <section aria-labelledby="nearby-heading" className="mt-6">
      <h3
        id="nearby-heading"
        className="text-foreground font-display text-xl font-normal italic md:text-2xl"
      >
        {t(sameDay ? "events.nearbySameDay" : "events.nearbyClosest")}
      </h3>
      <p className="text-ed-mute mt-1 font-sans text-xs">
        {t(sameDay ? "events.nearbySameDayHint" : "events.nearbyClosestHint", {
          radius: NEARBY_SUGGESTION_RADIUS_KM,
        })}
      </p>
      <ol className="mt-4 flex flex-col">
        {items.map((item, index) => (
          <li key={item.slug} className="border-primary/15 border-t first:border-t-0">
            <Link
              href={`/evenement/${item.slug}`}
              className="group hover:bg-primary/5 focus-visible:ring-primary/50 flex min-h-11 items-start gap-3 py-3 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <span
                className="border-primary text-primary mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs"
                aria-hidden="true"
              >
                {index + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-foreground group-hover:text-primary block font-serif text-base leading-snug break-words transition-colors">
                  {item.title}
                </span>
                <span className="text-ed-mute mt-0.5 block font-sans text-xs">
                  {item.city} · {t("events.distanceKm", { distance: item.distanceKm })}
                  {item.dateStart
                    ? ` · ${formatEventDateRange(item.dateStart, item.dateEnd, locale)}`
                    : null}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  )
}

export { NearbySuggestions }
