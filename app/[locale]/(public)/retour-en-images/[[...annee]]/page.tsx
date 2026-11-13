import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import { Marker } from "@/components/editorial/primitives"
import { GalleryGrid } from "@/components/gallery/gallery-grid"
import { getGalleryPhotos, getGalleryYears } from "@/lib/queries/gallery"
import type { Locale } from "@/lib/i18n/config"
import { cn } from "@/lib/utils"

export const revalidate = 86400

type GalleryPageProps = {
  params: Promise<{ locale: string; annee?: string[] }>
}

/** The requested edition, or the latest one; null when the URL names no gallery year. */
const resolveYear = async (annee?: string[]) => {
  const years = await getGalleryYears()
  if (!annee?.length) return { years, year: years[0] ?? null }
  const requested = Number(annee[0])
  return { years, year: annee.length === 1 && years.includes(requested) ? requested : null }
}

export const generateMetadata = async ({ params }: GalleryPageProps): Promise<Metadata> => {
  const { locale, annee } = (await params) as { locale: Locale; annee?: string[] }
  const t = await getTranslations({ locale, namespace: "gallery" })
  const { year } = await resolveYear(annee)
  return {
    title: year ? `${t("title")} — ${t("yearTitle", { year })}` : t("title"),
    description: t("intro"),
  }
}

const GalleryPage = async ({ params }: GalleryPageProps) => {
  const { locale, annee } = (await params) as { locale: Locale; annee?: string[] }
  const { years, year } = await resolveYear(annee)
  if (year === null) notFound()
  const [photos, t] = await Promise.all([
    getGalleryPhotos(year, locale),
    getTranslations({ locale, namespace: "gallery" }),
  ])

  return (
    <div>
      <div className="bg-ed-bg-deep border-primary/25 border-b px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-7xl">
          <Marker className="mb-5">{t("marker")}</Marker>
          <h1 className="text-foreground font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1] font-normal tracking-[-0.02em] italic">
            {t("title")}
          </h1>
          <p className="text-ed-bone mt-6 max-w-2xl font-serif text-xl font-light italic">
            {t("intro")}
          </p>
          {years.length > 1 && (
            <nav aria-label={t("yearsNav")} className="mt-8">
              <ul className="flex flex-wrap gap-2">
                {years.map((item) => (
                  <li key={item}>
                    <Link
                      href={item === years[0] ? "/retour-en-images" : `/retour-en-images/${item}`}
                      aria-current={item === year ? "page" : undefined}
                      className={cn(
                        "focus-visible:ring-primary/50 inline-flex min-h-11 items-center border px-5 font-mono text-sm tracking-[0.12em] transition-colors focus-visible:ring-2 focus-visible:outline-none",
                        item === year
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-primary/30 text-ed-bone hover:border-primary hover:text-primary"
                      )}
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </div>
      <section
        aria-labelledby="gallery-year"
        className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16"
      >
        <h2
          id="gallery-year"
          className="text-foreground font-display mb-8 text-3xl font-normal italic md:text-4xl"
        >
          {t("yearTitle", { year })}{" "}
          <span className="text-ed-bone font-sans text-base not-italic">
            · {t("count", { count: photos.length })}
          </span>
        </h2>
        <GalleryGrid photos={photos} />
      </section>
    </div>
  )
}

export default GalleryPage
