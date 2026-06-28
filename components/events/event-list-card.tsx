import { Link } from "@/lib/i18n/routing"
import NextImage from "next/image"
import { getLocale, getTranslations } from "next-intl/server"
import { MapPin, Calendar, Clock, Accessibility } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatEventDateRange, formatTime } from "@/lib/utils/format-date"
import type { EventListItem } from "@/lib/queries/events"
import { DEFAULT_EVENT_IMAGE } from "@/lib/events/default-image"

type EventListCardProps = {
  event: EventListItem
  className?: string
  priority?: boolean
}

const EventListCard = async ({ event, className, priority = false }: EventListCardProps) => {
  const locale = await getLocale()
  const t = await getTranslations()
  const coverImage = event.coverImage ?? DEFAULT_EVENT_IMAGE
  return (
    <Link
      href={`/evenement/${event.slug}`}
      className={cn(
        "group hover:border-primary/30 hover:shadow-primary/5 focus-visible:ring-primary/50 animate-fade-in-up relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none",
        className
      )}
    >
      {/* Cover image */}
      <div
        className={cn(
          "relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden",
          "from-primary/20 to-primary/5 bg-gradient-to-br"
        )}
      >
        <NextImage
          src={coverImage}
          alt={event.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          priority={priority}
        />
        {/* Category badge */}
        <span className="border-primary/30 bg-background/80 text-primary absolute top-3 left-3 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
          {t(`categories.${event.category}`) ?? event.category}
        </span>
        {/* Accessibility badge */}
        {event.accessible && (
          <span
            className="bg-background/80 absolute top-3 right-3 flex size-7 items-center justify-center rounded-full border border-white/20 backdrop-blur-sm"
            title={t("events.accessible")}
            aria-label={t("events.accessible")}
          >
            <Accessibility className="text-primary size-3.5" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-foreground group-hover:text-primary line-clamp-2 font-serif text-lg leading-snug font-bold transition-colors">
          {event.title}
        </h3>

        <div className="text-muted-foreground mt-auto flex flex-col gap-1.5 pt-3 text-sm">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{formatEventDateRange(event.dateStart, event.dateEnd, locale)}</span>
          </div>
          {event.timeStart && (
            <div className="flex items-center gap-1.5">
              <Clock className="size-3.5 shrink-0" aria-hidden="true" />
              <span>
                {formatTime(event.timeStart)}
                {event.timeEnd ? ` – ${formatTime(event.timeEnd)}` : ""}
              </span>
            </div>
          )}
          {event.city && (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{event.city}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

export { EventListCard }
