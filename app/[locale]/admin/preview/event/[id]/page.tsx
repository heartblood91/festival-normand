import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { localizeEntity } from "@/lib/i18n/db"
import { PreviewBar } from "@/components/admin/preview-bar"
import { EventInfo } from "@/components/event-detail/event-info"
import { PhotoCarousel } from "@/components/event-detail/photo-carousel"
import { EventMapWrapper } from "@/components/event-detail/event-map-wrapper"

type EventPreviewPageProps = {
  params: Promise<{ locale: string; id: string }>
}

const EventPreviewPage = async ({ params }: EventPreviewPageProps) => {
  const { locale, id } = (await params) as { locale: Locale; id: string }
  const t = await getTranslations()

  const rawEvent = await prisma.event.findUnique({
    where: { id },
  })

  if (!rawEvent) {
    notFound()
  }

  const event = {
    ...localizeEntity(rawEvent, locale, ["title", "description", "pricing"]),
    dateStart: rawEvent.dateStart?.toISOString() ?? null,
    dateEnd: rawEvent.dateEnd?.toISOString() ?? null,
    createdAt: rawEvent.createdAt.toISOString(),
    updatedAt: rawEvent.updatedAt.toISOString(),
  }

  const allImages = [...(event.coverImage ? [event.coverImage] : []), ...event.images]

  return (
    <>
      <PreviewBar backUrl={`/admin/events/${id}/edit`} />
      <article className="mx-auto max-w-7xl px-4 py-8 md:py-12 lg:py-16">
        {/* Title */}
        <h1 className="text-foreground mb-2 font-serif text-3xl font-bold md:text-4xl lg:text-5xl">
          {event.title}
        </h1>

        {/* Location badge */}
        <p className="text-primary mb-8 text-sm font-medium tracking-wider uppercase">
          {event.location} — {event.city}
        </p>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content — left column */}
          <div className="space-y-8 lg:col-span-2">
            {/* Photo carousel */}
            {allImages.length > 0 && <PhotoCarousel images={allImages} alt={event.title} />}

            {/* Description */}
            <section>
              <h2 className="text-foreground mb-4 font-serif text-xl font-bold md:text-2xl">
                {t("events.description")}
              </h2>
              <div className="prose prose-invert text-muted-foreground max-w-none">
                {event.description.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </section>

            {/* Map */}
            {event.latitude && event.longitude && (
              <section>
                <h2 className="text-foreground mb-4 font-serif text-xl font-bold md:text-2xl">
                  {t("events.location")}
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
              <EventInfo event={event} locale={locale} />
            </div>
          </aside>
        </div>
      </article>
    </>
  )
}

export default EventPreviewPage
