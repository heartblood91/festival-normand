import { getTranslations, getLocale } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import type { Locale } from "@/lib/i18n/config"
import type { ProgrammeTeaserEvent } from "@/lib/queries/homepage"
import { formatEventDate, formatTime } from "@/lib/utils/format-date"
import { SectionHeading } from "@/components/editorial/primitives"
import { EventThumb } from "@/components/editorial/event-thumb"

type ProgrammeTeaserProps = {
  events: ProgrammeTeaserEvent[]
  total: number
  markerIndex: string
}

const ProgrammeTeaser = async ({ events, total, markerIndex }: ProgrammeTeaserProps) => {
  if (events.length === 0) return null
  const t = await getTranslations()
  const locale = (await getLocale()) as Locale

  return (
    <section className="bg-ed-bg-deep border-primary/25 border-t px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          markerIndex={markerIndex}
          marker={t("editorial.programmeTeaser.marker")}
          title={t("editorial.programmeTeaser.title")}
          action={
            <Link
              href="/evenements"
              className="text-primary hover:text-ed-amber-soft focus-visible:ring-primary/50 border-primary inline-flex items-center rounded-sm border-b pb-1 font-sans text-xs tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("editorial.viewAll", { count: total })}
            </Link>
          }
        />

        <ul>
          {events.map((event, i) => (
            <li key={event.id}>
              <Link
                href={`/evenement/${event.slug}`}
                className="border-primary/15 hover:bg-primary/5 focus-visible:ring-primary/50 group grid grid-cols-[64px_1fr_auto] items-center gap-4 border-b py-5 transition-colors focus-visible:ring-2 focus-visible:outline-none md:grid-cols-[32px_88px_1fr_180px_140px_40px] md:gap-5"
              >
                <span className="text-primary hidden font-mono text-xs tracking-[0.14em] md:block">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <EventThumb
                  coverImage={event.coverImage}
                  category={event.category}
                  title={event.title}
                  seed={event.slug}
                  sizes="88px"
                  className="aspect-square w-16 md:w-22"
                />
                <div className="min-w-0">
                  <p className="text-foreground font-display truncate text-xl font-normal md:text-2xl">
                    {event.title}
                  </p>
                  <p className="text-ed-bone truncate font-serif text-sm italic opacity-85">
                    {event.location}, {event.city}
                  </p>
                </div>
                <p className="text-ed-bone hidden font-mono text-xs tracking-[0.14em] uppercase opacity-75 md:block">
                  {event.dateStart ? formatEventDate(event.dateStart, locale) : ""}
                  <br />
                  {formatTime(event.timeStart ?? undefined)}
                </p>
                <span className="border-primary/50 text-primary hidden justify-self-start border px-3 py-1.5 font-sans text-xs tracking-[0.16em] uppercase md:block">
                  {t(`categories.${event.category}`)}
                </span>
                <span
                  className="text-primary justify-self-end font-serif text-xl opacity-60 transition-transform group-hover:translate-x-1"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export { ProgrammeTeaser }
