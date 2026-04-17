import Link from "next/link"
import { getTranslations, getLocale } from "next-intl/server"
import { Button } from "@/components/ui/button"
import { SparkleIcon } from "@/components/ui/sparkle-icon"
import { HeroVideo } from "@/components/home/hero-video"

const HeroSection = async () => {
  const t = await getTranslations()
  const locale = await getLocale()
  return (
    <section
      className="relative flex min-h-[80dvh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center md:min-h-[85dvh] md:py-32"
      aria-label={t("hero.badge")}
    >
      <HeroVideo />
      <div
        className="from-background/80 via-background/60 to-background absolute inset-0 -z-10 bg-gradient-to-b"
        aria-hidden="true"
      />

      {/* Decorative ambient glow */}
      <div
        className="bg-primary/10 absolute top-1/3 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px]"
        aria-hidden="true"
      />

      <p className="border-primary/30 bg-primary/10 text-primary mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium md:text-base">
        <SparkleIcon className="size-4" />
        {t("hero.badge")}
      </p>

      <h1 className="text-foreground font-serif text-4xl leading-tight font-bold md:text-6xl lg:text-7xl">
        {t("hero.title")}
      </h1>

      <p className="text-muted-foreground mt-4 max-w-2xl text-base md:text-xl lg:text-2xl">
        {t("hero.subtitle")}
      </p>

      <p className="text-primary mt-3 text-lg font-semibold md:text-2xl lg:text-3xl">
        {t("meta.festivalDates")}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button asChild size="lg" className="h-12 px-6 text-base">
          <Link href={`/${locale}/evenements`}>{t("hero.cta")}</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
          <Link href={`/${locale}/inscription`}>{t("hero.ctaSecondary")}</Link>
        </Button>
      </div>
    </section>
  )
}

export { HeroSection }
