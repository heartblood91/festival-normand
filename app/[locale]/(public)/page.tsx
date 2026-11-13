import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import {
  getFeaturedEvents,
  getLatestNews,
  getPartners,
  getProgrammeTeaser,
  getHomeStats,
} from "@/lib/queries/homepage"
import {
  editionDateRange,
  getEditionMode,
  getCountdownDays,
  isDuringFestival,
} from "@/lib/festival/edition"
import { getCurrentEdition } from "@/lib/queries/edition"
import { getHomeThemes } from "@/lib/queries/themes"
import { getGalleryPhotos, getGalleryYears } from "@/lib/queries/gallery"
import { Hero } from "@/components/home/editorial/hero"
import { ThreeNights } from "@/components/home/editorial/three-nights"
import { Quote } from "@/components/home/editorial/quote"
import { NewsRow } from "@/components/home/editorial/news-row"
import { Highlights } from "@/components/home/editorial/highlights"
import { ProgrammeTeaser } from "@/components/home/editorial/programme-teaser"
import { NormandySection } from "@/components/home/editorial/normandy-section"
import { Partners } from "@/components/home/editorial/partners"
import { PastRevive } from "@/components/home/editorial/past-revive"
import { GalleryStrip } from "@/components/home/editorial/gallery-strip"
import { ThemeSpotlight } from "@/components/home/editorial/theme-spotlight"
import { Reveal } from "@/components/motion/reveal"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 300

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = (await params) as { locale: Locale }
  const dates = editionDateRange(await getCurrentEdition(), locale)
  const frenchTitle = "Pierres en Lumières — Festival du Patrimoine Normand"
  const englishTitle = "Pierres en Lumières — Festival of Norman Heritage"
  const frenchDesc = `Découvrez la magie du patrimoine normand en nocturne. ${dates}.`
  const englishDesc = `Discover the magic of Norman heritage by night. ${dates}.`

  const title = locale === "en" ? englishTitle : frenchTitle
  const description = locale === "en" ? englishDesc : frenchDesc

  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    alternates: {
      languages: { fr: `${BASE_URL}/fr`, en: `${BASE_URL}/en` },
    },
  }
}

type HomePageProps = {
  params: Promise<{ locale: string }>
}

const HomePage = async ({ params }: HomePageProps) => {
  const { locale } = (await params) as { locale: Locale }
  const edition = await getCurrentEdition()
  const mode = getEditionMode(edition)

  const [featured, news, partners, programme, stats, themes, galleryYears] = await Promise.all([
    getFeaturedEvents(locale, edition),
    getLatestNews(locale),
    getPartners(locale),
    getProgrammeTeaser(locale, edition),
    getHomeStats(edition),
    getHomeThemes(locale, edition),
    getGalleryYears(),
  ])
  // After the festival, its own photos; before it, the latest past edition's.
  const galleryYear = galleryYears.find((year) =>
    mode === "bilan" ? year === edition.year : year < edition.year
  )
  const galleryPhotos = galleryYear ? await getGalleryPhotos(galleryYear, locale, 8) : []

  const hero = (
    <Hero
      edition={edition}
      mode={mode}
      totalPlaces={stats.totalPlaces}
      countdownDays={getCountdownDays(edition)}
      live={isDuringFestival(edition)}
    />
  )

  // Sequential editorial markers — advance only for sections that actually
  // render, so the ¶ NN numbers never skip a number across edition modes.
  let markerCount = 0
  const nextMarker = () => String(++markerCount).padStart(2, "0")
  const hasNews = news.length > 0
  const hasFeatured = featured.length > 0
  const hasProgramme = programme.length > 0
  const hasPartners = partners.length > 0
  const themeSections = () =>
    themes.map((theme) => (
      <Reveal key={theme.slug}>
        <ThemeSpotlight theme={theme} year={edition.year} markerIndex={nextMarker()} />
      </Reveal>
    ))
  const normandy = () => (
    <Reveal>
      <NormandySection
        byDepartment={stats.byDepartment}
        totalPlaces={stats.totalPlaces}
        markerIndex={nextMarker()}
      />
    </Reveal>
  )
  const partnersSection = () =>
    hasPartners ? (
      <Reveal>
        <Partners partners={partners} markerIndex={nextMarker()} />
      </Reveal>
    ) : null
  const newsSection = () =>
    hasNews ? (
      <Reveal>
        <NewsRow news={news} mode={mode} markerIndex={nextMarker()} />
      </Reveal>
    ) : null
  const gallerySection = () =>
    galleryYear && galleryPhotos.length > 0 ? (
      <Reveal>
        <GalleryStrip
          year={galleryYear}
          latest={galleryYear === galleryYears[0]}
          photos={galleryPhotos}
          markerIndex={nextMarker()}
        />
      </Reveal>
    ) : null
  const highlightsSection = () =>
    hasFeatured ? (
      <Reveal>
        <Highlights events={featured} mode={mode} year={edition.year} markerIndex={nextMarker()} />
      </Reveal>
    ) : null

  if (mode === "bilan") {
    return (
      <>
        {hero}
        <Reveal>
          <PastRevive
            year={edition.year}
            markerIndex={nextMarker()}
            hasGallery={galleryYear === edition.year}
          />
        </Reveal>
        {gallerySection()}
        <Reveal>
          <Quote markerIndex={nextMarker()} />
        </Reveal>
        {themeSections()}
        {newsSection()}
        {highlightsSection()}
        {normandy()}
        {partnersSection()}
      </>
    )
  }

  return (
    <>
      {hero}
      <Reveal>
        <ThreeNights nights={edition.nights} byNight={stats.byNight} markerIndex={nextMarker()} />
      </Reveal>
      <Reveal>
        <Quote markerIndex={nextMarker()} />
      </Reveal>
      {themeSections()}
      {newsSection()}
      {highlightsSection()}
      {hasProgramme ? (
        <Reveal>
          <ProgrammeTeaser
            events={programme}
            total={stats.totalPlaces}
            markerIndex={nextMarker()}
          />
        </Reveal>
      ) : null}
      {gallerySection()}
      {normandy()}
      {partnersSection()}
    </>
  )
}

export default HomePage
