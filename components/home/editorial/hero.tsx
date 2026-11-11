import { getTranslations, getLocale } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import type { Locale } from "@/lib/i18n/config"
import { editionKicker, type Edition, type EditionMode } from "@/lib/festival/edition"
import { heroVideoSrc } from "@/lib/festival/hero-video"
import { HeroVideoBg } from "@/components/home/editorial/hero-video-bg"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { countdownStart } from "@/lib/motion/tween"

type HeroProps = {
  edition: Edition
  mode: EditionMode
  totalPlaces: number
  countdownDays: number
  live: boolean
}

const Hero = async ({ edition, mode, totalPlaces, countdownDays, live }: HeroProps) => {
  const t = await getTranslations()
  const locale = (await getLocale()) as Locale

  // A zero counter reads as "nothing here": hide it until places are published.
  const stats = [
    { n: totalPlaces, l: t("editorial.stats.places") },
    { n: edition.departmentsCount, l: t("editorial.stats.departments") },
    { n: edition.nights.length, l: t("editorial.stats.nights") },
  ].filter((stat) => stat.n > 0)

  const status =
    mode === "bilan"
      ? t("editorial.pastStatus", { year: edition.year, nextYear: edition.year + 1 })
      : live
        ? t("editorial.liveStatus")
        : t.rich("editorial.upcomingStatus", {
            days: countdownDays,
            n: () => (
              <AnimatedNumber
                value={countdownDays}
                from={countdownStart(countdownDays)}
                testId="hero-countdown"
              />
            ),
          })

  return (
    <section
      className="relative isolate overflow-hidden px-4 py-20 text-center md:px-6 md:py-28 lg:py-32"
      aria-label={t("hero.badge")}
    >
      <HeroVideoBg src={heroVideoSrc()} />
      {/* readability overlays */}
      <div
        className="from-ed-bg-deep/85 via-ed-bg-deep/45 to-ed-bg-deep absolute inset-0 -z-[1] bg-gradient-to-b"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 -z-[1] [background:radial-gradient(ellipse_at_center,transparent_30%,var(--ed-bg-deep)_100%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-4xl">
        <p
          data-testid="hero-kicker"
          className="text-primary mb-6 inline-flex items-center gap-3 font-mono text-xs tracking-[0.12em] uppercase sm:tracking-[0.28em]"
        >
          <span className="bg-primary/50 hidden h-px w-6 sm:block" aria-hidden="true" />
          {editionKicker(edition, mode, locale)}
          <span className="bg-primary/50 hidden h-px w-6 sm:block" aria-hidden="true" />
        </p>

        <h1 className="text-foreground font-display text-[clamp(3rem,11vw,9.5rem)] leading-[0.94] font-normal tracking-[-0.025em]">
          Pierres en <span className="text-primary italic">Lumières</span>
        </h1>

        <p className="text-ed-bone mx-auto mt-7 max-w-xl font-serif text-xl font-light italic md:text-2xl">
          {t("hero.subtitle")}
        </p>

        {/* Key stats */}
        <dl className="border-primary/25 mx-auto mt-12 flex max-w-xl items-start justify-center gap-10 border-y py-8 md:gap-16">
          {stats.map((s) => (
            // Term before value in the DOM (read « lieux illuminés : 4 »), number on top visually.
            <div key={s.l} className="flex flex-col-reverse text-center">
              <dt className="text-ed-mute mt-2.5 font-mono text-xs tracking-[0.2em] uppercase">
                {s.l}
              </dt>
              <dd className="text-primary font-display text-4xl leading-none font-normal tracking-tight md:text-5xl">
                <AnimatedNumber value={s.n} />
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/evenements"
            className="bg-primary text-primary-foreground hover:bg-ed-amber-deep focus-visible:ring-ring ed-halo inline-flex w-full items-center justify-center px-8 py-4 font-sans text-xs font-semibold tracking-[0.14em] uppercase focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
          >
            {t("editorial.discoverProgramme")}
          </Link>
          <Link
            href="/evenements?view=map"
            className="border-ed-cream/50 text-foreground hover:border-primary hover:text-primary focus-visible:ring-primary/50 ed-halo inline-flex w-full items-center justify-center border px-8 py-4 font-sans text-xs font-medium tracking-[0.14em] uppercase focus-visible:ring-2 focus-visible:outline-none sm:w-auto"
          >
            {t("editorial.viewMap")}
          </Link>
        </div>

        <p className="text-ed-mute mt-12 inline-flex items-center gap-2.5 font-mono text-xs tracking-[0.18em] uppercase">
          <span
            className="bg-primary animate-ed-pulse size-1.5 rounded-full [box-shadow:0_0_10px_var(--primary)]"
            aria-hidden="true"
          />
          {status}
        </p>
      </div>
    </section>
  )
}

export { Hero }
