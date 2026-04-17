import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { HeroSection } from "@/components/home/hero-section"
import { SearchBar } from "@/components/home/search-bar"
import { FeaturedEvents } from "@/components/home/featured-events"
import { NewsCarousel } from "@/components/home/news-carousel"
import { PartnersSection } from "@/components/home/partners-section"
import {
  getFeaturedEvents,
  getLatestNews,
  getPartners,
  getEventCities,
} from "@/lib/queries/homepage"

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
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr`,
        en: `${BASE_URL}/en`,
      },
    },
  }
}

type HomePageProps = {
  params: Promise<{ locale: string }>
}

const HomePage = async ({ params }: HomePageProps) => {
  const { locale } = (await params) as { locale: Locale }
  const [events, news, partners, cities] = await Promise.all([
    getFeaturedEvents(locale),
    getLatestNews(locale),
    getPartners(locale),
    getEventCities(),
  ])

  return (
    <>
      <HeroSection />
      <SearchBar cities={cities} />
      <FeaturedEvents events={events} />
      <NewsCarousel news={news} />
      <PartnersSection partners={partners} />
    </>
  )
}

export default HomePage
