import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { getEventBySlug } from "@/lib/queries/events"
import { EventInfo } from "@/components/event-detail/event-info"
import { PhotoCarousel } from "@/components/event-detail/photo-carousel"
import { EventMapWrapper } from "@/components/event-detail/event-map-wrapper"
import { prisma } from "@/lib/prisma"
import { locales } from "@/lib/i18n/config"

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
  const t = await getTranslations()
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

  const allImages = [...(event.coverImage ? [event.coverImage] : []), ...event.images]

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
  )
}

export default EventDetailPage
