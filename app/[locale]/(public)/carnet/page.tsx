import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Marker } from "@/components/editorial/primitives"
import { MyTravelBook } from "@/components/travel-book/my-travel-book"
import type { Locale } from "@/lib/i18n/config"

type TravelBookPageProps = {
  params: Promise<{ locale: string }>
}

export const generateMetadata = async ({ params }: TravelBookPageProps): Promise<Metadata> => {
  const { locale } = (await params) as { locale: Locale }
  const t = await getTranslations({ locale, namespace: "travelBook" })
  return {
    title: t("title"),
    description: t("metaDescription"),
    // Content depends on this browser's storage: nothing to index.
    robots: { index: false, follow: true },
  }
}

const TravelBookPage = async ({ params }: TravelBookPageProps) => {
  const { locale } = (await params) as { locale: Locale }
  setRequestLocale(locale)
  const t = await getTranslations()

  return (
    <div>
      <div className="bg-ed-bg-deep border-primary/25 border-b px-4 py-14 text-center md:px-6 md:py-16 print:py-6">
        <Marker className="mb-4 inline-block">{t("meta.festivalName")}</Marker>
        <h1 className="text-foreground font-display mx-auto max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] font-normal tracking-[-0.025em] italic">
          {t("travelBook.title")}
        </h1>
        <p className="text-ed-bone mx-auto mt-5 max-w-2xl font-serif text-lg font-light italic md:text-xl">
          {t("travelBook.lede")}
        </p>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-10 md:px-6">
        <MyTravelBook />
      </div>
    </div>
  )
}

export default TravelBookPage
