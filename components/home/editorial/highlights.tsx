import { getTranslations, getLocale } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import type { Locale } from "@/lib/i18n/config"
import type { EditionMode } from "@/lib/festival/edition"
import type { FeaturedEvent } from "@/lib/queries/homepage"
import { formatEventDate, formatTime } from "@/lib/utils/format-date"
import { SectionHeading } from "@/components/editorial/primitives"
import { EventThumb } from "@/components/editorial/event-thumb"

type HighlightsProps = {
  events: FeaturedEvent[]
  mode: EditionMode
  year: number
  markerIndex: string
}

const Highlights = async ({ events, mode, year, markerIndex }: HighlightsProps) => {
  if (events.length === 0) return null
  const t = await getTranslations()
  const locale = (await getLocale()) as Locale
  const past = mode === "bilan"

  return (
    <section className="bg-ed-bg-deep border-primary/25 border-t px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          markerIndex={markerIndex}
          marker={
            past
              ? t("editorial.highlights.markerPast", { year })
              : t("editorial.highlights.markerUpcoming")
          }
          title={t(`editorial.highlights.title${past ? "Past" : "Upcoming"}`)}
          lede={t(`editorial.highlights.lede${past ? "Past" : "Upcoming"}`)}
          action={
            <Link
              href="/evenements"
              className="text-primary hover:text-ed-amber-soft focus-visible:ring-primary/50 border-primary inline-flex items-center rounded-sm border-b pb-1 font-sans text-xs tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("featured.viewAll")} →
            </Link>
          }
        />

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event, i) => {
            const price = event.pricing?.trim() || t("events.free")
            const time = formatTime(event.timeStart ?? undefined)
            return (
              <li key={event.id} className="flex">
                <Link
                  href={`/evenement/${event.slug}`}
                  className="bg-ed-bg-soft border-primary/25 hover:border-primary/50 focus-visible:ring-primary/50 group flex flex-1 flex-col border ed-halo focus-visible:ring-2 focus-visible:outline-none"
                >
                  <div className="relative">
                    <EventThumb
                      coverImage={event.coverImage}
                      category={event.category}
                      title={event.title}
                      seed={event.slug}
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="border-primary/30 aspect-[16/11] w-full border-0 border-b"
                    />
                    <span
                      className="text-foreground font-display absolute top-3 left-4 text-4xl font-normal italic [text-shadow:0_0_20px_rgba(0,0,0,0.6)]"
                      aria-hidden="true"
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 p-7">
                    <h3 className="text-foreground font-display text-2xl leading-tight font-normal tracking-tight italic">
                      {event.title}
                    </h3>
                    <p className="text-ed-bone font-serif text-base font-light italic">
                      {event.location}, {event.city}
                    </p>
                    <dl className="border-primary/25 text-ed-bone mt-auto grid grid-cols-2 gap-x-4 gap-y-1.5 border-t pt-4 font-mono text-xs tracking-[0.12em] uppercase">
                      <dt className="sr-only">{t("events.date")}</dt>
                      <dd>
                        {event.dateStart ? formatEventDate(event.dateStart, locale) : ""}
                        {time ? ` · ${time}` : ""}
                      </dd>
                      <dt className="sr-only">{t("events.pricing")}</dt>
                      <dd className="text-primary text-right">{price}</dd>
                      <dt className="sr-only">{t("filters.category")}</dt>
                      <dd className="text-ed-mute">{t(`categories.${event.category}`)}</dd>
                      <dd className="text-ed-mute text-right" aria-hidden="true">
                        {t(`departments.${event.department}`)}
                      </dd>
                    </dl>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export { Highlights }
