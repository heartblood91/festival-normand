import Link from "next/link"
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

const CATEGORY_LABELS: Record<string, string> = {
  ILLUMINATIONS: "Illuminations",
  EXPOSITIONS: "Expositions",
  ANIMATIONS: "Animations",
  VISITES: "Visites",
}

const CATEGORY_SLUG_MAP: Record<string, string> = {
  ILLUMINATIONS: "illuminations",
  EXPOSITIONS: "expositions",
  ANIMATIONS: "animations",
  VISITES: "visites",
}

const DEPARTMENT_LABELS: Record<string, string> = {
  CALVADOS: "Calvados",
  EURE: "Eure",
  MANCHE: "Manche",
  ORNE: "Orne",
  SEINE_MARITIME: "Seine-Maritime",
}

const DEPARTMENT_SLUG_MAP: Record<string, string> = {
  CALVADOS: "calvados",
  EURE: "eure",
  MANCHE: "manche",
  ORNE: "orne",
  SEINE_MARITIME: "seine-maritime",
}

const formatEventDate = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

const formatTime = (time: string | undefined): string | undefined => {
  if (!time) return undefined
  return time.slice(0, 5)
}

type EventInfoProps = {
  event: EventDetail
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
    <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <div className="mt-0.5 text-foreground">{children}</div>
    </div>
  </div>
)

const EventInfo = ({ event }: EventInfoProps) => {
  const dateDisplay = (() => {
    const start = formatEventDate(event.dateStart)
    if (event.dateEnd) {
      const end = formatEventDate(event.dateEnd)
      if (start === end) return start
      return `Du ${start} au ${end}`
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
          className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {CATEGORY_LABELS[event.category] ?? event.category}
        </Link>
        <Link
          href={departmentSlug ? `/evenements?dept=${departmentSlug}` : "#"}
          className="rounded-full border border-white/20 bg-white/5 px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {DEPARTMENT_LABELS[event.department] ?? event.department}
        </Link>
        {event.accessible && (
          <span className="flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            <Accessibility className="size-3.5" aria-hidden="true" />
            Accessible PMR
          </span>
        )}
      </div>

      {/* Info card */}
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
        <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
          Informations pratiques
        </h2>
        <div className="space-y-4">
          <InfoRow icon={Calendar} label="Date">
            <p>{dateDisplay}</p>
          </InfoRow>

          {(event.timeStart || event.timeEnd) && (
            <InfoRow icon={Clock} label="Horaires">
              <p>
                {formatTime(event.timeStart)}
                {event.timeEnd ? ` - ${formatTime(event.timeEnd)}` : ""}
              </p>
            </InfoRow>
          )}

          <InfoRow icon={MapPin} label="Lieu">
            <p>{event.location}</p>
            <p className="text-sm text-muted-foreground">
              {event.postalCode} {event.city}
            </p>
          </InfoRow>

          {event.pricing && (
            <InfoRow icon={Euro} label="Tarification">
              <p>{event.pricing}</p>
            </InfoRow>
          )}

          {event.organizer && (
            <InfoRow icon={Building2} label="Organisateur">
              <p>{event.organizer}</p>
            </InfoRow>
          )}
        </div>
      </div>

      {/* Contact card */}
      {(event.email || event.phone || event.website) && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl md:p-6">
          <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
            Contact
          </h2>
          <div className="space-y-4">
            {event.email && (
              <InfoRow icon={Mail} label="Email">
                <a
                  href={`mailto:${event.email}`}
                  className="text-primary underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {event.email}
                </a>
              </InfoRow>
            )}
            {event.phone && (
              <InfoRow icon={Phone} label="Téléphone">
                <a
                  href={`tel:${event.phone}`}
                  className="text-primary underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                >
                  {event.phone}
                </a>
              </InfoRow>
            )}
            {event.website && (
              <InfoRow icon={Globe} label="Site web">
                <a
                  href={event.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline-offset-2 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
