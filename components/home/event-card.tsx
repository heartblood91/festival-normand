import Link from "next/link"
import { MapPin, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { FeaturedEvent } from "@/lib/queries/homepage"

const CATEGORY_LABELS: Record<string, string> = {
  ILLUMINATIONS: "Illuminations",
  EXPOSITIONS: "Expositions",
  ANIMATIONS: "Animations",
  VISITES: "Visites",
}

const formatEventDate = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "long",
  }).format(new Date(date))
}

const formatTime = (time: string | undefined): string | undefined => {
  if (!time) return undefined
  return time.slice(0, 5)
}

type EventCardProps = {
  event: FeaturedEvent
  className?: string
}

const EventCard = ({ event, className }: EventCardProps) => {
  return (
    <Link
      href={`/evenement/${event.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-primary/30 hover:bg-white/10 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
    >
      {/* Cover image or gradient placeholder */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {event.coverImage && (
          <img
            src={event.coverImage}
            alt={event.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full border border-primary/30 bg-background/80 px-2.5 py-1 text-xs font-medium text-primary backdrop-blur-sm">
          {CATEGORY_LABELS[event.category] ?? event.category}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-bold leading-snug text-foreground group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{formatEventDate(event.dateStart)}</span>
            {event.timeStart && (
              <span>
                · {formatTime(event.timeStart)}
                {event.timeEnd ? ` - ${formatTime(event.timeEnd)}` : ""}
              </span>
            )}
          </div>
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

export { EventCard, CATEGORY_LABELS, formatEventDate }
