import Link from "next/link"
import { getTranslations } from "next-intl/server"
import {
  Calendar,
  Clock,
  MapPin,
  Euro,
  Building2,
  Mail,
  Phone,
  Globe,
  Accessibility,
} from "lucide-react"
import type { EventDetail } from "@/lib/queries/events"

const CATEGORY_SLUG_MAP: Record<string, string> = {
  ILLUMINATIONS: "illuminations",
  EXPOSITIONS: "expositions",
  ANIMATIONS: "animations",
  VISITES: "visites",
}

const DEPARTMENT_SLUG_MAP: Record<string, string> = {
  CALVADOS: "calvados",
  EURE: "eure",
  MANCHE: "manche",
  ORNE: "orne",
  SEINE_MARITIME: "seine-maritime",
}

const formatEventDate = (date: Date | string, locale: string): string => {
  const localeStr = locale === "en" ? "en-US" : "fr-FR"
  return new Intl.DateTimeFormat(localeStr, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

const formatTime = (time: string | undefined | null): string | undefined => {
  if (!time) return undefined
  return time.slice(0, 5)
}

type EventInfoProps = {
  event: EventDetail
  locale: string
}

const InfoRow = ({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  children: React.ReactNode
}) => (
  <div className="flex items-start gap-3">
    <Icon className="text-primary mt-0.5 size-5 shrink-0" aria-hidden="true" />
    <div>
      <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">{label}</p>
      <div className="text-foreground mt-0.5">{children}</div>
    </div>
  </div>
)

const EventInfo = async ({ event, locale }: EventInfoProps) => {
  const t = await getTranslations()
  const dateDisplay = (() => {
    const start = formatEventDate(event.dateStart, locale)
    if (event.dateEnd) {
      const end = formatEventDate(event.dateEnd, locale)
      if (start === end) return start
      return `${t("events.date")}: ${start} à ${end}`
    }
    return start
  })()

  const categorySlug = CATEGORY_SLUG_MAP[event.category]
  const departmentSlug = DEPARTMENT_SLUG_MAP[event.department]

  return (
    <div className="space-y-6">
      {/* Category + Department badges */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={categorySlug ? `/evenements?category=${categorySlug}` : "#"}
          className="border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary/50 rounded-full border px-3 py-1 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
        >
          {t(`categories.${event.category}`) ?? event.category}
        </Link>
        <Link
          href={departmentSlug ? `/evenements?dept=${departmentSlug}` : "#"}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:outline-none"
        >
          {t(`departments.${event.department}`) ?? event.department}
        </Link>
        {event.accessible && (
          <span className="border-primary/30 bg-primary/10 text-primary flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium">
            <Accessibility className="size-3.5" aria-hidden="true" />
            {t("events.accessible")}
          </span>
        )}
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
        <h2 className="text-foreground mb-4 font-serif text-lg font-bold">
          {t("events.practicalInfo")}
        </h2>
        <div className="space-y-4">
          <InfoRow icon={Calendar} label={t("events.date")}>
            <p>{dateDisplay}</p>
          </InfoRow>

          {(event.timeStart || event.timeEnd) && (
            <InfoRow icon={Clock} label={t("events.time")}>
              <p>
                {formatTime(event.timeStart)}
                {event.timeEnd ? ` - ${formatTime(event.timeEnd)}` : ""}
              </p>
            </InfoRow>
          )}

          <InfoRow icon={MapPin} label={t("events.venue")}>
            <p>{event.location}</p>
            <p className="text-muted-foreground text-sm">
              {event.postalCode} {event.city}
            </p>
          </InfoRow>

          {event.pricing && (
            <InfoRow icon={Euro} label={t("events.pricing")}>
              <p>{event.pricing}</p>
            </InfoRow>
          )}

          {event.organizer && (
            <InfoRow icon={Building2} label={t("events.organizer")}>
              <p>{event.organizer}</p>
            </InfoRow>
          )}
        </div>
      </div>

      {/* Contact card */}
      {(event.email || event.phone || event.website) && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
          <h2 className="text-foreground mb-4 font-serif text-lg font-bold">
            {t("footer.contact")}
          </h2>
          <div className="space-y-4">
            {event.email && (
              <InfoRow icon={Mail} label="Email">
                <a
                  href={`mailto:${event.email}`}
                  className="text-primary focus-visible:ring-primary/50 break-all underline-offset-2 transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
                >
                  {event.email}
                </a>
              </InfoRow>
            )}
            {event.phone && (
              <InfoRow icon={Phone} label={t("events.organizer")}>
                <a
                  href={`tel:${event.phone}`}
                  className="text-primary focus-visible:ring-primary/50 underline-offset-2 transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
                >
                  {event.phone}
                </a>
              </InfoRow>
            )}
            {event.website && (
              <InfoRow icon={Globe} label={t("events.organizer")}>
                <a
                  href={event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary focus-visible:ring-primary/50 underline-offset-2 transition-colors hover:underline focus-visible:ring-2 focus-visible:outline-none"
                >
                  {event.website}
                </a>
              </InfoRow>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export { EventInfo }
