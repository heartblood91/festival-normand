import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Marker } from "@/components/editorial/primitives"
import { TravelBookList } from "@/components/travel-book/travel-book-list"
import { TravelBookMap } from "@/components/travel-book/travel-book-map"
import { ImportTravelBook, PrintButton } from "@/components/travel-book/travel-book-actions"
import { getTravelBook, getTravelBookEvents } from "@/lib/queries/travel-book"
import type { Locale } from "@/lib/i18n/config"

type SharedTravelBookPageProps = {
  params: Promise<{ locale: string; id: string }>
}

export const generateMetadata = async ({
  params,
}: SharedTravelBookPageProps): Promise<Metadata> => {
  const { locale } = (await params) as { locale: Locale }
  const t = await getTranslations({ locale, namespace: "travelBook" })
  return {
    title: t("sharedTitle"),
    description: t("metaDescription"),
    robots: { index: false, follow: true },
  }
}

const SharedTravelBookPage = async ({ params }: SharedTravelBookPageProps) => {
  const { locale, id } = (await params) as { locale: Locale; id: string }
  setRequestLocale(locale)
  const book = await getTravelBook(id)
  if (!book) notFound()

  const t = await getTranslations()
  const events = await getTravelBookEvents(book.eventIds, locale)

  return (
    <div>
      <div className="bg-ed-bg-deep border-primary/25 border-b px-4 py-14 text-center md:px-6 md:py-16 print:py-6">
        <Marker className="mb-4 inline-block">
          {t("meta.festivalName")} — {t("travelBook.count", { count: events.length })}
        </Marker>
        <h1 className="text-foreground font-display mx-auto max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] font-normal tracking-[-0.025em] italic">
          {t("travelBook.sharedTitle")}
        </h1>
        <p className="text-ed-bone mx-auto mt-5 max-w-2xl font-serif text-lg font-light italic md:text-xl">
          {t("travelBook.sharedLede")}
        </p>
      </div>
      <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-10 md:px-6">
        {events.length > 0 ? (
          <>
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between print:hidden">
              <ImportTravelBook eventIds={events.map((event) => event.id)} />
              <PrintButton />
            </div>
            <TravelBookMap events={events} />
            <TravelBookList events={events} />
          </>
        ) : (
          <p className="text-ed-bone font-serif italic">
            {t("travelBook.unavailable", { count: book.eventIds.length })}
          </p>
        )}
      </div>
    </div>
  )
}

export default SharedTravelBookPage
