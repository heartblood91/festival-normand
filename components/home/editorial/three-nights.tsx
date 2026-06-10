import { getTranslations, getLocale } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import type { Locale } from "@/lib/i18n/config"
import { EDITION } from "@/lib/festival/edition"
import { Marker } from "@/components/editorial/primitives"

type ThreeNightsProps = {
  byNight: Record<string, number>
}

const ThreeNights = async ({ byNight }: ThreeNightsProps) => {
  const t = await getTranslations()
  const locale = (await getLocale()) as Locale
  const isEn = locale === "en"

  return (
    <section className="border-primary/25 bg-background border-t px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 text-center">
          <Marker index="01" className="mb-3 inline-block">
            {t("editorial.threeNights.marker")}
          </Marker>
          <h2 className="text-foreground font-display text-4xl font-normal tracking-tight italic md:text-5xl">
            {t("editorial.threeNights.title")}
          </h2>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {EDITION.nights.map((night) => (
            <Link
              key={night.code}
              href={`/evenements?date=${night.code}`}
              className="bg-ed-bg-soft border-primary/20 hover:border-primary/50 focus-visible:ring-primary/50 group flex flex-col border p-8 transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              <div className="mb-6 flex items-baseline gap-3.5">
                <span className="text-primary font-display text-7xl leading-none font-normal italic md:text-8xl">
                  {night.code}
                </span>
                <span className="text-ed-mute font-mono text-[10px] leading-tight tracking-[0.2em] uppercase">
                  {isEn ? night.weekdayEn : night.weekdayFr}
                  <br />
                  {isEn ? `May ${EDITION.year}` : `mai ${EDITION.year}`}
                </span>
              </div>
              <p className="text-foreground font-display mb-3 text-2xl font-normal italic">
                {isEn ? night.subEn : night.subFr}
              </p>
              <p className="text-ed-bone flex-1 font-serif text-base font-light">
                {isEn ? night.descEn : night.descFr}
              </p>
              <div className="border-primary/30 text-primary mt-6 flex items-center justify-between border-t pt-4 font-mono text-[10px] tracking-[0.16em] uppercase">
                <span>
                  {t("editorial.threeNights.nightsLabel", {
                    count: byNight[night.code] ?? 0,
                  })}
                </span>
                <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                  {t("editorial.threeNights.see")}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export { ThreeNights }
