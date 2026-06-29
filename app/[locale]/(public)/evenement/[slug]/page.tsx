import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { getEventBySlug, getNeighbourEvents } from "@/lib/queries/events"
import { EventInfo } from "@/components/event-detail/event-info"
import { PhotoCarousel, type CarouselPhoto } from "@/components/event-detail/photo-carousel"
import { EventMapWrapper } from "@/components/event-detail/event-map-wrapper"
import { prisma } from "@/lib/prisma"
import { locales } from "@/lib/i18n/config"
import { DEFAULT_EVENT_IMAGE } from "@/lib/events/default-image"
import { isInNormandyBounds } from "@/lib/geo/normandy"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 1800

export const generateStaticParams = async () => {
  const events = await prisma.event.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return locales.flatMap((locale) => events.map((e) => ({ locale, slug: e.slug })))
}

type EventDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export const generateMetadata = async ({ params }: EventDetailPageProps): Promise<Metadata> => {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const event = await getEventBySlug(slug, locale)

  if (!event) {
    return { title: locale === "en" ? "Event not found" : "Événement introuvable" }
  }

  return {
    title: event.title,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description.slice(0, 160),
      images: event.coverImage ? [{ url: event.coverImage }] : [],
      type: "article",
    },
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/evenement/${slug}`,
        en: `${BASE_URL}/en/evenement/${slug}`,
      },
    },
  }
}

const EventDetailPage = async ({ params }: EventDetailPageProps) => {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const t = await getTranslations()
  const event = await getEventBySlug(slug, locale)

  if (!event) {
    notFound()
  }

  const hasNormandyCoordinates = isInNormandyBounds(event)
  const neighbours = hasNormandyCoordinates
    ? await getNeighbourEvents(slug, event.latitude as number, event.longitude as number, locale)
    : []

  // Prefer the relational photos (with credit); fall back to coverImage/images
  // for legacy/seed events that predate the Tourinsoft import.
  const photos: CarouselPhoto[] =
    event.photos.length > 0
      ? event.photos.map((photo) => ({ url: photo.url, credit: photo.credit, title: photo.title }))
      : [{ url: event.coverImage ?? DEFAULT_EVENT_IMAGE }, ...event.images.map((url) => ({ url }))]

  return (
    <article className="mx-auto max-w-7xl px-4 py-8 md:py-12 lg:py-16">
      {/* Breadcrumb */}
      <nav aria-label={t("a11y.breadcrumb")} className="mb-6">
        <ol className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <li>
            <Link
              href={`/${locale}`}
              className="hover:text-foreground focus-visible:ring-primary/50 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("events.breadcrumbHome")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-foreground/50">
            /
          </li>
          <li>
            <Link
              href={`/${locale}/evenements`}
              className="hover:text-foreground focus-visible:ring-primary/50 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("events.breadcrumbEvents")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-foreground/50">
            /
          </li>
          <li aria-current="page" className="text-foreground font-medium">
            {event.title}
          </li>
        </ol>
      </nav>

      {/* Back link */}
      <Link
        href={`/${locale}/evenements`}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 mb-6 inline-flex items-center gap-2 text-sm transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("events.backToEvents")}
      </Link>

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
          {photos.length > 0 && <PhotoCarousel photos={photos} alt={event.title} />}

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
          {hasNormandyCoordinates && (
            <section>
              <h2 className="text-foreground mb-4 font-serif text-xl font-bold md:text-2xl">
                {t("events.location")}
              </h2>
              <EventMapWrapper
                latitude={event.latitude as number}
                longitude={event.longitude as number}
                title={event.title}
                locale={locale}
                neighbours={neighbours}
              />
            </section>
          )}
        </div>

        {/* Sidebar — right column. Intentionally NOT sticky: a sticky aside
            against a long main column gives users the impression that the
            two halves scroll independently, which our test users found
            confusing. Let the whole page scroll as one block. */}
        <aside className="lg:col-span-1">
          <EventInfo event={event} locale={locale} />
        </aside>
      </div>
    </article>
  )
}

export default EventDetailPage
