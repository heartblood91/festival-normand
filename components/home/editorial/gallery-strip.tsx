import { getTranslations } from "next-intl/server"
import { ArrowRight } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { SectionHeading } from "@/components/editorial/primitives"
import { GalleryGrid } from "@/components/gallery/gallery-grid"
import type { PublicGalleryPhoto } from "@/lib/queries/gallery"

type GalleryStripProps = {
  year: number
  /** Whether the year is the gallery's latest, reachable at /retour-en-images. */
  latest: boolean
  photos: PublicGalleryPhoto[]
  markerIndex: string
}

const GalleryStrip = async ({ year, latest, photos, markerIndex }: GalleryStripProps) => {
  if (photos.length === 0) return null
  const t = await getTranslations("gallery")

  return (
    <section className="bg-background border-primary/25 border-t px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          markerIndex={markerIndex}
          marker={t("marker")}
          title={t("homeTitle", { year })}
          action={
            <Link
              href={latest ? "/retour-en-images" : `/retour-en-images/${year}`}
              className="text-primary hover:text-ed-amber-soft focus-visible:ring-primary/50 inline-flex min-h-11 items-center gap-2 font-sans text-xs font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("homeLink")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          }
        />
        <GalleryGrid photos={photos} />
      </div>
    </section>
  )
}

export { GalleryStrip }
