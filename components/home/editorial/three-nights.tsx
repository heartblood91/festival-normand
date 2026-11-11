import { getTranslations, getLocale } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import type { Locale } from "@/lib/i18n/config"
import { formatNight, type FestivalNight } from "@/lib/festival/edition"
import { Marker } from "@/components/editorial/primitives"
import { cn } from "@/lib/utils"

type ThreeNightsProps = {
  nights: FestivalNight[]
  byNight: Record<string, number>
  markerIndex: string
}

const GRID_COLUMNS: Record<number, string> = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-2 lg:grid-cols-4",
  5: "md:grid-cols-3 lg:grid-cols-5",
}

const ThreeNights = async ({ nights, byNight, markerIndex }: ThreeNightsProps) => {
  const t = await getTranslations()
  const locale = (await getLocale()) as Locale

  return (
    <section className="border-primary/25 bg-background border-t px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Marker index={markerIndex} className="mb-3 inline-block">
            {t("editorial.threeNights.marker", { count: nights.length })}
          </Marker>
          <h2 className="text-foreground font-display text-4xl font-normal tracking-tight italic md:text-5xl">
            {t("editorial.threeNights.title", { count: nights.length })}
          </h2>
        </div>

        <div className={cn("grid gap-5", GRID_COLUMNS[nights.length])}>
          {nights.map((night) => {
            const count = byNight[night.code] ?? 0
            return (
              <Link
                key={night.date}
                href={`/evenements?date=${night.code}`}
                className="bg-ed-bg-soft border-primary/20 hover:border-primary/50 focus-visible:ring-primary/50 group flex flex-col border p-8 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {/* The visual date reads « 21 Vendredi mai 2027 »: give screen readers the natural order. */}
                <span className="sr-only">
                  {`${formatNight(night, locale, "weekday")} ${night.code} ${formatNight(night, locale, "monthYear")}`}
                </span>
                <div className="mb-6 flex items-baseline gap-3.5" aria-hidden="true">
                  <span className="text-primary font-display text-7xl leading-none font-normal italic md:text-8xl">
                    {night.code}
                  </span>
                  <span className="text-ed-mute font-mono text-[10px] leading-tight tracking-[0.2em] uppercase">
                    {formatNight(night, locale, "weekday")}
                    <br />
                    {formatNight(night, locale, "monthYear")}
                  </span>
                </div>
                <p className="text-foreground font-display mb-3 text-2xl font-normal italic">
                  {t(`editorial.threeNights.roles.${night.role}.sub`)}
                </p>
                <p className="text-ed-bone flex-1 font-serif text-base font-light">
                  {t(`editorial.threeNights.roles.${night.role}.desc`)}
                </p>
                <div className="border-primary/30 text-primary mt-6 flex items-center justify-between border-t pt-4 font-mono text-[10px] tracking-[0.16em] uppercase">
                  {/* No "0 animations" before the programme is published */}
                  <span>
                    {count > 0 ? t("editorial.threeNights.nightsLabel", { count }) : null}
                  </span>
                  <span
                    aria-hidden="true"
                    className="transition-transform group-hover:translate-x-1"
                  >
                    {t("editorial.threeNights.see")}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { ThreeNights }
