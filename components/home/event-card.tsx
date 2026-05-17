import { Link } from "@/lib/i18n/routing"
import Image from "next/image"
import { getLocale, getTranslations } from "next-intl/server"
import { MapPin, Calendar, Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatEventDateRange, formatTime } from "@/lib/utils/format-date"
import type { FeaturedEvent } from "@/lib/queries/homepage"

type EventCardProps = {
  event: FeaturedEvent
  className?: string
  priority?: boolean
}

const EventCard = async ({ event, className, priority = false }: EventCardProps) => {
  const t = await getTranslations()
  const locale = await getLocale()
  return (
    <Link
      href={`/evenement/${event.slug}`}
      className={cn(
        "group hover:border-primary/30 hover:shadow-primary/5 focus-visible:ring-primary/50 relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10 hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none",
        className
      )}
    >
      {/* Cover image or gradient placeholder */}
      <div className="from-primary/20 to-primary/5 relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br">
        {event.coverImage && (
          <Image
            src={event.coverImage}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            priority={priority}
          />
        )}
        {/* Category badge */}
        <span className="border-primary/30 bg-background/80 text-primary absolute top-3 left-3 rounded-full border px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
          {t(`categories.${event.category}`) ?? event.category}
        </span>
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

export { EventCard }
