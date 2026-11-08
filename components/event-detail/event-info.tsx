import { getTranslations } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import { formatFullDate, formatTime } from "@/lib/utils/format-date"
import type { EventDetail } from "@/lib/queries/events"

type EventInfoProps = {
  event: EventDetail
  locale: string
}

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="border-primary/15 flex items-baseline justify-between gap-4 border-b pb-2.5 last:border-b-0">
    <dt className="text-ed-mute shrink-0 font-mono text-[10px] tracking-[0.18em] uppercase">
      {label}
    </dt>
    <dd className="text-foreground text-right font-serif text-base italic">{value}</dd>
  </div>
)

// Editorial "practical info" card pinned beside the event title.
const EventInfo = async ({ event, locale }: EventInfoProps) => {
  const t = await getTranslations()

  const dateDisplay = (() => {
    const start = formatFullDate(event.dateStart, locale)
    if (event.dateEnd) {
      const end = formatFullDate(event.dateEnd, locale)
      if (start !== end) return `${start} — ${end}`
    }
    return start
  })()

  const timeDisplay = (() => {
    const start = formatTime(event.timeStart ?? undefined)
    if (!start) return undefined
    const end = formatTime(event.timeEnd ?? undefined)
    return end ? `${start} – ${end}` : start
  })()

  return (
    <div className="bg-ed-bg-soft border-primary/25 border p-6">
      <h2 className="text-primary mb-5 font-mono text-[10.5px] tracking-[0.22em] uppercase">
        <span aria-hidden="true">¶</span> {t("events.practicalInfo")}
      </h2>
      <dl className="grid gap-3.5">
        <Row label={t("events.date")} value={dateDisplay} />
        {timeDisplay ? <Row label={t("events.time")} value={timeDisplay} /> : null}
        <Row
          label={t("events.venue")}
          value={
            <span>
              {event.location}
              <br />
              <span className="text-ed-bone text-sm not-italic opacity-80">
                {event.postalCode} {event.city}
              </span>
            </span>
          }
        />
        {event.pricing ? (
          <Row
            label={t("events.pricing")}
            value={<span className="text-primary">{event.pricing}</span>}
          />
        ) : null}
        {event.organizer ? <Row label={t("events.organizer")} value={event.organizer} /> : null}
        {event.accessible ? <Row label={t("filters.pmr")} value={t("events.accessible")} /> : null}
        {event.themes.length > 0 ? (
          <Row
            label={t("events.themes")}
            value={
              <span className="flex flex-wrap justify-end gap-x-3 gap-y-1">
                {event.themes.map((theme) => (
                  <Link
                    key={theme.slug}
                    href={`/evenements?theme=${theme.slug}`}
                    className="text-primary hover:text-ed-amber-soft focus-visible:ring-primary/50 inline-flex min-h-6 items-center gap-1.5 rounded-sm underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <span
                      className="size-2 rounded-full not-italic"
                      style={{ backgroundColor: theme.color }}
                      aria-hidden="true"
                    />
                    {theme.name}
                  </Link>
                ))}
              </span>
            }
          />
        ) : null}
      </dl>
    </div>
  )
}

export { EventInfo }
