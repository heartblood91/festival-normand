import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Link } from "@/lib/i18n/routing"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getEventBySlug, getNeighbourEvents } from "@/lib/queries/events"
import { EventInfo } from "@/components/event-detail/event-info"
import { EventContact } from "@/components/event-detail/event-contact"
import { PhotoCarousel, type CarouselPhoto } from "@/components/event-detail/photo-carousel"
import { EventMapWrapper } from "@/components/event-detail/event-map-wrapper"
import { Marker } from "@/components/editorial/primitives"
import { prisma } from "@/lib/prisma"
import { publicEventWhere } from "@/lib/queries/visibility"
import { locales } from "@/lib/i18n/config"
import { DEFAULT_EVENT_IMAGE } from "@/lib/events/default-image"
import { isInNormandyBounds } from "@/lib/geo/normandy"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 1800
// Fail the build instead of serving 500s if a dynamic API (headers, cookies)
// sneaks into this ISR route: on-demand renders of new slugs would crash.
export const dynamic = "error"

export const generateStaticParams = async () => {
  const events = await prisma.event.findMany({
    where: await publicEventWhere(),
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
  setRequestLocale(locale)
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
  const [hero] = photos
  const paragraphs = event.description.split("\n").filter((p) => p.trim().length > 0)

  return (
    <article>
      {/* Breadcrumb */}
      <nav
        aria-label={t("a11y.breadcrumb")}
        className="border-primary/15 bg-background border-b px-4 py-4 md:px-6"
      >
        <ol className="text-ed-mute mx-auto flex max-w-7xl flex-wrap items-center gap-2.5 font-mono text-[10.5px] tracking-[0.16em] uppercase">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              {t("events.breadcrumbHome")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-primary/50">
            ›
          </li>
          <li>
            <Link href="/evenements" className="hover:text-primary transition-colors">
              {t("nav.events")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-primary/50">
            ›
          </li>
          <li aria-current="page" className="text-primary truncate">
            {event.title}
          </li>
        </ol>
      </nav>

      {/* Hero image — credits must stay visible whenever a photo is shown */}
      <figure className="relative h-[42vh] min-h-72 w-full overflow-hidden md:h-[55vh]">
        <Image
          src={hero.url}
          alt={event.title}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
        <div
          className="from-ed-bg-deep/60 to-background absolute inset-0 bg-gradient-to-b via-transparent"
          aria-hidden="true"
        />
        {hero.credit ? (
          <figcaption className="bg-ed-bg-deep/70 text-ed-bone absolute right-3 bottom-3 px-2 py-0.5 font-sans text-xs backdrop-blur-sm">
            © {hero.credit}
          </figcaption>
        ) : null}
      </figure>

      {/* Title + practical info */}
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div>
            <div className="mb-5 flex flex-wrap gap-2.5">
              <Link
                href={`/evenements?category=${event.category.toLowerCase()}`}
                className="border-primary/50 text-primary hover:bg-primary/10 focus-visible:ring-primary/50 border px-3 py-1.5 font-sans text-[10px] tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {t(`categories.${event.category}`)}
              </Link>
              {event.accessible ? (
                <span className="bg-primary text-primary-foreground px-3 py-1.5 font-sans text-[10px] font-semibold tracking-[0.16em] uppercase">
                  {t("events.accessible")}
                </span>
              ) : null}
            </div>
            <h1 className="text-foreground font-display text-[clamp(2.25rem,6vw,5rem)] leading-[0.98] font-normal tracking-[-0.025em] break-words italic">
              {event.title}
            </h1>
            <p className="text-ed-bone mt-4 font-serif text-xl font-light italic md:text-2xl">
              {event.location} · {event.city}, {t(`departments.${event.department}`)}
            </p>
          </div>

          {/* Intentionally NOT sticky: a sticky aside next to a long main column
              made test users think the two halves scrolled independently. */}
          <aside>
            <EventInfo event={event} locale={locale} />
          </aside>
        </div>
      </div>

      {/* Description + gallery + location */}
      <div className="mx-auto max-w-7xl px-4 pb-16 md:px-6 md:pb-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:gap-16">
          <div className="min-w-0">
            <Marker as="h2" className="mb-5">
              {t("events.description")}
            </Marker>
            <div className="text-ed-bone font-serif text-lg leading-relaxed font-light break-words md:text-xl">
              {paragraphs.map((paragraph, i) => (
                <p key={i} className={i === 0 ? "ed-dropcap" : "mt-6"}>
                  {paragraph}
                </p>
              ))}
            </div>

            {photos.length > 1 ? (
              <div className="mt-10">
                <PhotoCarousel photos={photos} alt={event.title} />
              </div>
            ) : null}
          </div>

          <aside className="flex min-w-0 flex-col gap-6">
            {hasNormandyCoordinates ? (
              <section className="bg-ed-bg-deep border-primary/25 border p-6">
                <h2 className="text-primary mb-4 font-mono text-[10.5px] tracking-[0.22em] uppercase">
                  <span aria-hidden="true">¶</span> {t("events.location")}
                </h2>
                <EventMapWrapper
                  latitude={event.latitude as number}
                  longitude={event.longitude as number}
                  title={event.title}
                  locale={locale}
                  neighbours={neighbours}
                />
                <p className="text-ed-bone mt-4 font-serif text-base italic">
                  {event.location}
                  <br />
                  <span className="text-ed-mute text-sm not-italic">
                    {event.postalCode} {event.city}
                  </span>
                </p>
              </section>
            ) : null}
            <EventContact event={event} />
          </aside>
        </div>
      </div>
    </article>
  )
}

export default EventDetailPage
