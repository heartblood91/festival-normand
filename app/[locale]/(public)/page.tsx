import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import {
  getFeaturedEvents,
  getLatestNews,
  getPartners,
  getProgrammeTeaser,
  getHomeStats,
} from "@/lib/queries/homepage"
import { getEditionMode, getCountdownDays, isDuringFestival } from "@/lib/festival/edition"
import { Hero } from "@/components/home/editorial/hero"
import { ThreeNights } from "@/components/home/editorial/three-nights"
import { Quote } from "@/components/home/editorial/quote"
import { NewsRow } from "@/components/home/editorial/news-row"
import { Highlights } from "@/components/home/editorial/highlights"
import { ProgrammeTeaser } from "@/components/home/editorial/programme-teaser"
import { NormandySection } from "@/components/home/editorial/normandy-section"
import { Partners } from "@/components/home/editorial/partners"
import { PastRevive } from "@/components/home/editorial/past-revive"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 300

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = (await params) as { locale: Locale }
  const frenchTitle = "Pierres en Lumières — Festival du Patrimoine Normand"
  const englishTitle = "Pierres en Lumières — Festival of Norman Heritage"
  const frenchDesc = "Découvrez la magie du patrimoine normand en nocturne. 29, 30 & 31 mai 2026."
  const englishDesc = "Discover the magic of Norman heritage by night. May 29, 30 & 31, 2026."

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
  const mode = getEditionMode()

  const [featured, news, partners, programme, stats] = await Promise.all([
    getFeaturedEvents(locale),
    getLatestNews(locale),
    getPartners(locale),
    getProgrammeTeaser(locale),
    getHomeStats(),
  ])

  const hero = (
    <Hero
      mode={mode}
      totalPlaces={stats.totalPlaces}
      countdownDays={getCountdownDays()}
      live={isDuringFestival()}
    />
  )

  if (mode === "bilan") {
    return (
      <>
        {hero}
        <PastRevive />
        <Quote />
        <NewsRow news={news} mode={mode} markerIndex="03" />
        <Highlights events={featured} mode={mode} />
        <NormandySection byDepartment={stats.byDepartment} totalPlaces={stats.totalPlaces} />
        <Partners partners={partners} />
      </>
    )
  }

  return (
    <>
      {hero}
      <ThreeNights byNight={stats.byNight} />
      <Quote />
      <NewsRow news={news} mode={mode} />
      <Highlights events={featured} mode={mode} />
      <ProgrammeTeaser events={programme} total={stats.totalPlaces} />
      <NormandySection byDepartment={stats.byDepartment} totalPlaces={stats.totalPlaces} />
      <Partners partners={partners} />
    </>
  )
}

export default HomePage
