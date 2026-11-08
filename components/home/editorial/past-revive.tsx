import { getTranslations } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import { Marker } from "@/components/editorial/primitives"

type PastReviveProps = {
  year: number
  markerIndex: string
  /** Render the gallery CTA only when there is gallery content to link to. */
  hasGallery?: boolean
  /** Render the replays CTA only when there are mapping replays available. */
  hasReplays?: boolean
}

const PastRevive = async ({
  year,
  markerIndex,
  hasGallery = false,
  hasReplays = false,
}: PastReviveProps) => {
  const t = await getTranslations()

  return (
    <section className="bg-background border-primary/25 border-t px-4 py-16 md:px-6 md:py-20">
      <div className="mx-auto max-w-4xl text-center">
        <Marker index={markerIndex} className="mb-3 inline-block">
          {t("editorial.past.marker")}
        </Marker>
        <h2 className="text-foreground font-display text-4xl font-normal tracking-tight italic md:text-5xl">
          {t("editorial.past.title", { year })}
        </h2>
        <p className="text-ed-bone mx-auto mt-6 max-w-2xl font-serif text-lg font-light italic">
          {t("editorial.past.text")}
        </p>
        <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
          {hasGallery ? (
            <Link
              href="/evenements?view=map"
              className="bg-primary text-primary-foreground hover:bg-ed-amber-deep focus-visible:ring-ring inline-flex items-center px-6 py-3.5 font-sans text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              {t("editorial.past.gallery", { year })}
            </Link>
          ) : null}
          {hasReplays ? (
            <Link
              href="/actualites"
              className="border-ed-cream/50 text-foreground hover:border-primary hover:text-primary focus-visible:ring-primary/50 inline-flex items-center border px-6 py-3.5 font-sans text-[11px] font-medium tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("editorial.past.replays")}
            </Link>
          ) : null}
          <Link
            href="/evenements"
            className="border-ed-cream/50 text-foreground hover:border-primary hover:text-primary focus-visible:ring-primary/50 inline-flex items-center border px-6 py-3.5 font-sans text-[11px] font-medium tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
          >
            {t("editorial.discoverProgramme")}
          </Link>
        </div>
      </div>
    </section>
  )
}

export { PastRevive }
