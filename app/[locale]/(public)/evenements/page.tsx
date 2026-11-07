import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { Suspense } from "react"
import { getEvents, getFilterCounts, getAllFilteredEventsForMap } from "@/lib/queries/events"
import { getEventCities } from "@/lib/queries/homepage"
import { getCurrentEdition } from "@/lib/queries/edition"
import { formatNight } from "@/lib/festival/edition"
import { EventListCard } from "@/components/events/event-list-card"
import { Pagination } from "@/components/events/pagination"
import { FilterBar } from "@/components/events/filter-bar"
import { EventsSearchBar } from "@/components/events/events-search-bar"
import { ViewToggle } from "@/components/events/view-toggle"
import { EventsMapWrapper } from "@/components/events/events-map-wrapper"
import { NearbyButton } from "@/components/events/nearby-button"
import { Marker } from "@/components/editorial/primitives"
import { getTranslations } from "next-intl/server"
import { MapPin } from "lucide-react"
import type { Category, Department } from "@prisma/client"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 300

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = (await params) as { locale: Locale }
  const frenchTitle = "Événements"
  const englishTitle = "Events"
  const frenchDesc =
    "Découvrez tous les événements du festival Pierres en Lumières en Normandie. Illuminations, expositions, animations et visites nocturnes du patrimoine normand."
  const englishDesc =
    "Discover all the events of the Pierres en Lumières festival in Normandy. Illuminations, exhibitions, animations and night tours of Norman heritage."

  const title = locale === "en" ? englishTitle : frenchTitle
  const description = locale === "en" ? englishDesc : frenchDesc

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Pierres en Lumières`,
      description,
    },
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/evenements`,
        en: `${BASE_URL}/en/evenements`,
      },
    },
  }
}

type EventsPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const parseSearchParams = (params: Record<string, string | string[] | undefined>) => {
  const getString = (key: string): string | undefined => {
    const val = params[key]
    return typeof val === "string" ? val : undefined
  }

  const page = parseInt(getString("page") ?? "1", 10)

  const lat = parseFloat(getString("lat") ?? "")
  const lng = parseFloat(getString("lng") ?? "")

  return {
    search: getString("search"),
    dates: getString("date")?.split(",").filter(Boolean),
    category: getString("category")?.toUpperCase() as Category | undefined,
    department: getString("dept")?.toUpperCase() as Department | undefined,
    accessible: getString("accessible") === "true",
    page: isNaN(page) || page < 1 ? 1 : page,
    lat: isNaN(lat) ? undefined : lat,
    lng: isNaN(lng) ? undefined : lng,
  }
}

const EventsPage = async ({ params, searchParams }: EventsPageProps) => {
  const { locale } = (await params) as { locale: Locale }
  const searchParamsData = await searchParams
  const filters = parseSearchParams(searchParamsData)
  const view = (searchParamsData.view as string | undefined) ?? "grid"

  const t = await getTranslations()
  const [
    { events, total, page, totalPages, outsideRadius, nearestDistanceKm },
    cities,
    counts,
    mapEvents,
    edition,
  ] = await Promise.all([
    getEvents(filters, locale),
    getEventCities(),
    getFilterCounts(filters),
    view === "map" ? getAllFilteredEventsForMap(filters, locale) : Promise.resolve([]),
    getCurrentEdition(),
  ])
  const nights = edition.nights.map((night) => ({
    value: night.code,
    short: formatNight(night, locale, "short"),
    long: formatNight(night, locale, "long"),
  }))

  return (
    <div>
      {/* Page header */}
      <div className="bg-ed-bg-deep border-primary/25 border-b px-4 py-14 text-center md:px-6 md:py-16">
        <Marker className="mb-4 inline-block">
          {t("nav.events")} — {t("filters.eventCount", { count: total })}
        </Marker>
        <h1 className="text-foreground font-display mx-auto max-w-4xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] font-normal tracking-[-0.025em] italic">
          {t("events.title")}
        </h1>
        <p className="text-ed-bone mx-auto mt-5 max-w-2xl font-serif text-lg font-light italic md:text-xl">
          {t("events.subtitle", { count: total })}
        </p>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-10">
        {/* Search bar */}
        <div className="mb-6">
          <Suspense>
            <EventsSearchBar cities={cities} />
          </Suspense>
        </div>

        {/* Filter bar */}
        <div className="mb-6">
          <Suspense>
            <FilterBar nights={nights} total={total} counts={counts} />
          </Suspense>
        </div>

        {/* View toggle + nearby */}
        <div className="mb-8 flex items-center justify-between">
          <Suspense>
            <NearbyButton />
          </Suspense>
          <ViewToggle />
        </div>

        {outsideRadius && nearestDistanceKm !== null && (
          <div
            role="status"
            aria-live="polite"
            className="border-primary/30 bg-primary/10 text-ed-bone mb-8 flex items-start gap-3 border p-4 font-serif text-sm"
          >
            <MapPin className="text-primary mt-0.5 size-4 shrink-0" aria-hidden />
            <p className="leading-snug">
              {t("events.nearbyFallback", { distance: nearestDistanceKm })}
            </p>
          </div>
        )}

        {/* Content based on view */}
        <h2 className="sr-only">{t("events.results")}</h2>
        {events.length > 0 ? (
          <>
            {view === "map" ? (
              <div className="mb-10">
                <EventsMapWrapper events={mapEvents} />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {events.map((event, index) => (
                    <div
                      key={event.id}
                      className="h-full"
                      style={{ "--stagger-index": index } as React.CSSProperties}
                    >
                      <EventListCard
                        event={event}
                        priority={index < 3}
                        className="h-full [animation-delay:calc(var(--stagger-index)*50ms)]"
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="mt-12">
                  <Suspense>
                    <Pagination currentPage={page} totalPages={totalPages} />
                  </Suspense>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="border-primary/20 bg-ed-bg-soft flex flex-col items-center justify-center border px-6 py-20 text-center">
            <p className="text-foreground font-display text-2xl font-normal italic">
              {t("events.noResults")}
            </p>
            <p className="text-ed-bone mt-2 font-serif">{t("events.noResultsHint")}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventsPage
