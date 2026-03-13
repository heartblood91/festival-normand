import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getEventBySlug } from "@/lib/queries/events"
import { EventInfo } from "@/components/event-detail/event-info"
import { PhotoCarousel } from "@/components/event-detail/photo-carousel"
import { EventMapWrapper } from "@/components/event-detail/event-map-wrapper"

export const revalidate = 3600

type EventDetailPageProps = {
  params: Promise<{ slug: string }>
}

export const generateMetadata = async ({ params }: EventDetailPageProps): Promise<Metadata> => {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    return { title: "Événement introuvable | Pierres en Lumières" }
  }

  return {
    title: `${event.title} | Pierres en Lumières`,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      images: event.coverImage ? [{ url: event.coverImage }] : [],
      type: "article",
    },
  }
}

const EventDetailPage = async ({ params }: EventDetailPageProps) => {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    notFound()
  }

  const allImages = [
    ...(event.coverImage ? [event.coverImage] : []),
    ...event.images,
  ]

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 md:py-12 lg:py-16">
      {/* Back link */}
      <Link
        href="/evenements"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:rounded-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour aux événements
      </Link>

      {/* Title */}
      <h1 className="mb-2 font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
        {event.title}
      </h1>

      {/* Location badge */}
      <p className="mb-8 text-sm font-medium uppercase tracking-wider text-primary">
        {event.location} — {event.city}
      </p>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main content — left column */}
        <div className="space-y-8 lg:col-span-2">
          {/* Photo carousel */}
          {allImages.length > 0 && (
            <PhotoCarousel images={allImages} alt={event.title} />
          )}

          {/* Description */}
          <section>
            <h2 className="mb-4 font-serif text-xl font-bold text-foreground md:text-2xl">
              Description
            </h2>
            <div className="prose prose-invert max-w-none text-muted-foreground">
              {event.description.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>

          {/* Map */}
          {event.latitude && event.longitude && (
            <section>
              <h2 className="mb-4 font-serif text-xl font-bold text-foreground md:text-2xl">
                Localisation
              </h2>
              <EventMapWrapper
                latitude={event.latitude}
                longitude={event.longitude}
                title={event.title}
              />
            </section>
          )}
        </div>

        {/* Sidebar — right column */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24">
            <EventInfo event={event} />
          </div>
        </aside>
      </div>
    </article>
  )
}

export default EventDetailPage
