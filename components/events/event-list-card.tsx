import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"
import { MapPin, Calendar, Accessibility, Flame, Image, Music, MapPin as MapPinIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatEventDate, formatTime } from "@/lib/utils/format-date"
import type { EventListItem } from "@/lib/queries/events"

const CATEGORY_GRADIENTS: Record<string, string> = {
  ILLUMINATIONS: "from-amber-900/30 to-amber-700/10",
  EXPOSITIONS: "from-blue-900/30 to-blue-700/10",
  ANIMATIONS: "from-purple-900/30 to-purple-700/10",
  VISITES: "from-emerald-900/30 to-emerald-700/10",
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ILLUMINATIONS: <Flame className="size-8" />,
  EXPOSITIONS: <Image className="size-8" />,
  ANIMATIONS: <Music className="size-8" />,
  VISITES: <MapPinIcon className="size-8" />,
}

type EventListCardProps = {
  event: EventListItem
  className?: string
  priority?: boolean
}

const EventListCard = async ({ event, className, priority = false }: EventListCardProps) => {
  const locale = await getLocale()
  const t = await getTranslations()
  return (
    <Link
      href={`/evenement/${event.slug}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-primary/30 hover:bg-white/10 hover:shadow-lg hover:shadow-primary/5 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 animate-fade-in-up",
        className
      )}
    >
      {/* Cover image or gradient placeholder */}
      <div className={cn(
        "relative aspect-[16/10] w-full overflow-hidden flex items-center justify-center",
        event.coverImage
          ? "bg-gradient-to-br from-primary/20 to-primary/5"
          : `bg-gradient-to-br ${CATEGORY_GRADIENTS[event.category] || "from-primary/20 to-primary/5"}`
      )}>
        {event.coverImage && (
          <img
            src={event.coverImage}
            alt={event.title}
            width={680}
            height={425}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        )}
        {!event.coverImage && (
          <div className="flex items-center justify-center text-primary/60">
            {CATEGORY_ICONS[event.category]}
          </div>
        )}
        {/* Category badge */}
        <span className="absolute left-3 top-3 rounded-full border border-primary/30 bg-background/80 px-2.5 py-1 text-xs font-medium text-primary backdrop-blur-sm">
          {t(`categories.${event.category}`) ?? event.category}
        </span>
        {/* Accessibility badge */}
        {event.accessible && (
          <span
            className="absolute right-3 top-3 flex size-7 items-center justify-center rounded-full border border-white/20 bg-background/80 backdrop-blur-sm"
            title={t("filters.accessible")}
            aria-label={t("filters.accessible")}
          >
            <Accessibility className="size-3.5 text-primary" />
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-serif text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
          {event.title}
        </h3>

        <div className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{formatEventDate(event.dateStart, locale)}</span>
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

export { EventListCard }
