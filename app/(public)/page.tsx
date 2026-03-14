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

export const revalidate = 300

const HomePage = async () => {
  const [events, news, partners, cities] = await Promise.all([
    getFeaturedEvents(),
    getLatestNews(),
    getPartners(),
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
