import { Link } from "@/lib/i18n/routing"
import { getLocale, getTranslations } from "next-intl/server"
import { Accessibility, HandHeart } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatEventDateRange, formatTime } from "@/lib/utils/format-date"
import { DEFAULT_EVENT_IMAGE } from "@/lib/events/default-image"
import { EventThumb } from "@/components/editorial/event-thumb"
import { FavoriteButton } from "@/components/travel-book/favorite-button"
import type { EventListItem } from "@/lib/queries/events"

type EventListCardProps = {
  event: EventListItem
  className?: string
  priority?: boolean
}

const EventListCard = async ({ event, className, priority = false }: EventListCardProps) => {
  const locale = await getLocale()
  const t = await getTranslations()

  // The favourite button is a sibling of the link: a button inside a link is invalid.
  return (
    <div className={cn("animate-fade-in-up relative", className)}>
      <Link
        href={`/evenement/${event.slug}`}
        className="group bg-ed-bg-soft border-primary/20 hover:border-primary/50 focus-visible:ring-primary/50 flex h-full flex-col border ed-halo focus-visible:ring-2 focus-visible:outline-none"
      >
        <div className="relative">
          <EventThumb
            coverImage={event.coverImage ?? DEFAULT_EVENT_IMAGE}
            category={event.category}
            title={event.title}
            seed={event.slug}
            priority={priority}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="border-primary/30 aspect-[16/10] w-full border-0 border-b"
          />
          <span className="border-primary/40 bg-ed-bg-deep/85 text-primary absolute top-3 left-3 border px-2.5 py-1 font-sans text-xs tracking-[0.14em] uppercase backdrop-blur-sm">
            {t(`categories.${event.category}`)}
          </span>
          {event.accessible ? (
            <span
              className="bg-ed-bg-deep/85 border-primary/40 text-primary absolute bottom-3 left-3 flex size-7 items-center justify-center border backdrop-blur-sm"
              title={t("events.accessible")}
              aria-label={t("events.accessible")}
            >
              <Accessibility className="size-3.5" aria-hidden="true" />
            </span>
          ) : null}
          {event.fundraisingUrl ? (
            <span
              className="bg-primary text-primary-foreground absolute right-3 bottom-3 flex items-center gap-1.5 px-2.5 py-1 font-sans text-xs font-semibold tracking-[0.14em] uppercase"
              title={t("fundraising.badgeLabel")}
            >
              <HandHeart className="size-3.5" aria-hidden="true" />
              {t("fundraising.badge")}
            </span>
          ) : null}
        </div>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <h3 className="text-foreground group-hover:text-primary font-display text-xl leading-snug font-normal tracking-tight transition-colors">
            {event.title}
          </h3>
          <p className="text-ed-bone font-serif text-sm italic opacity-85">
            {event.location}
            {event.city ? `, ${event.city}` : ""}
          </p>
          <p className="border-primary/20 text-ed-mute mt-auto flex items-center justify-between border-t pt-3 font-mono text-xs tracking-[0.12em] uppercase">
            <span>{formatEventDateRange(event.dateStart, event.dateEnd, locale)}</span>
            {formatTime(event.timeStart ?? undefined) ? (
              <span className="text-primary">{formatTime(event.timeStart ?? undefined)}</span>
            ) : null}
          </p>
        </div>
      </Link>
      <FavoriteButton eventId={event.id} title={event.title} className="absolute top-2 right-2" />
    </div>
  )
}

export { EventListCard }
