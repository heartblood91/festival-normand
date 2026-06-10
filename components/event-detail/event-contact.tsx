import { getTranslations } from "next-intl/server"
import { Mail, Phone, Globe } from "lucide-react"
import type { EventDetail } from "@/lib/queries/events"

type EventContactProps = {
  event: EventDetail
}

const EventContact = async ({ event }: EventContactProps) => {
  if (!event.email && !event.phone && !event.website) return null
  const t = await getTranslations()

  return (
    <div className="bg-ed-bg-deep border-primary/25 border p-6">
      <p className="text-primary mb-4 font-mono text-[10.5px] tracking-[0.22em] uppercase">
        <span aria-hidden="true">¶</span> {t("events.organizer")}
      </p>
      {event.organizer ? (
        <p className="text-foreground font-display mb-3 text-lg font-normal italic">
          {event.organizer}
        </p>
      ) : null}
      <ul className="grid gap-2.5">
        {event.email ? (
          <li>
            <a
              href={`mailto:${event.email}`}
              className="text-ed-bone hover:text-primary focus-visible:ring-primary/50 flex items-center gap-2.5 rounded-sm font-serif text-base break-all transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Mail className="text-primary size-4 shrink-0" aria-hidden="true" />
              {event.email}
            </a>
          </li>
        ) : null}
        {event.phone ? (
          <li>
            <a
              href={`tel:${event.phone}`}
              className="text-ed-bone hover:text-primary focus-visible:ring-primary/50 flex items-center gap-2.5 rounded-sm font-serif text-base transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Phone className="text-primary size-4 shrink-0" aria-hidden="true" />
              {event.phone}
            </a>
          </li>
        ) : null}
        {event.website ? (
          <li>
            <a
              href={event.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ed-bone hover:text-primary focus-visible:ring-primary/50 flex items-center gap-2.5 rounded-sm font-serif text-base break-all transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <Globe className="text-primary size-4 shrink-0" aria-hidden="true" />
              {event.website.replace(/^https?:\/\//, "")}
            </a>
          </li>
        ) : null}
      </ul>
    </div>
  )
}

export { EventContact }
