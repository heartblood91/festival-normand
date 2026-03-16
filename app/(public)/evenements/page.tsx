import type { Metadata } from "next"
import { Suspense } from "react"
import { getEvents, getFilterCounts, getAllFilteredEventsForMap } from "@/lib/queries/events"
import { getEventCities } from "@/lib/queries/homepage"
import { EventListCard } from "@/components/events/event-list-card"
import { Pagination } from "@/components/events/pagination"
import { FilterBar } from "@/components/events/filter-bar"
import { EventsSearchBar } from "@/components/events/events-search-bar"
import { ViewToggle } from "@/components/events/view-toggle"
import { EventsMapWrapper } from "@/components/events/events-map-wrapper"
import { NearbyButton } from "@/components/events/nearby-button"
import type { Category, Department } from "@prisma/client"

export const revalidate = 300

export const metadata: Metadata = {
  title: "Événements",
  description:
    "Découvrez tous les événements du festival Pierres en Lumières en Normandie. Illuminations, expositions, animations et visites nocturnes du patrimoine normand.",
  openGraph: {
    title: "Événements - Pierres en Lumières",
    description:
      "Découvrez tous les événements du festival Pierres en Lumières en Normandie. Illuminations, expositions, animations et visites nocturnes du patrimoine normand.",
  },
}

type EventsPageProps = {
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
    date: getString("date"),
    category: getString("category")?.toUpperCase() as Category | undefined,
    department: getString("dept")?.toUpperCase() as Department | undefined,
    accessible: getString("accessible") === "true",
    page: isNaN(page) || page < 1 ? 1 : page,
    lat: isNaN(lat) ? undefined : lat,
    lng: isNaN(lng) ? undefined : lng,
  }
}

const EventsPage = async ({ searchParams }: EventsPageProps) => {
  const params = await searchParams
  const filters = parseSearchParams(params)
  const view = (params.view as string | undefined) ?? "grid"

  const [{ events, total, page, totalPages }, cities, counts, mapEvents] = await Promise.all([
    getEvents(filters),
    getEventCities(),
    getFilterCounts(filters),
    view === "map" ? getAllFilteredEventsForMap(filters) : Promise.resolve([]),
  ])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 lg:py-16">
      {/* Page header */}
      <div className="mb-8 md:mb-10">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
          Événements
        </h1>
        <p className="mt-2 text-muted-foreground md:text-lg">
          Découvrez les {total} événements du festival à travers la Normandie
        </p>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <Suspense>
          <EventsSearchBar cities={cities} />
        </Suspense>
      </div>

      {/* Filter bar */}
      <div className="mb-6">
        <Suspense>
          <FilterBar total={total} counts={counts} />
        </Suspense>
      </div>

      {/* View toggle + nearby */}
      <div className="mb-6 flex items-center justify-between">
        <Suspense>
          <NearbyButton />
        </Suspense>
        <ViewToggle />
      </div>

      {/* Content based on view */}
      <h2 className="sr-only">Résultats</h2>
      {events.length > 0 ? (
        <>
          {view === "map" ? (
            <div className="mb-10">
              <EventsMapWrapper events={mapEvents} />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-4">
                {events.map((event, index) => (
                  <div
                    key={event.id}
                    style={{ '--stagger-index': index } as React.CSSProperties}
                  >
                    <EventListCard
                      event={event}
                      priority={index < 4}
                      className="[animation-delay:calc(var(--stagger-index)*50ms)]"
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-10">
                <Suspense>
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                  />
                </Suspense>
              </div>
            </>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center">
          <p className="font-serif text-xl font-bold text-foreground">
            Aucun événement trouvé
          </p>
          <p className="mt-2 text-muted-foreground">
            Essayez de modifier vos filtres ou votre recherche
          </p>
        </div>
      )}
    </div>
  )
}

export default EventsPage
