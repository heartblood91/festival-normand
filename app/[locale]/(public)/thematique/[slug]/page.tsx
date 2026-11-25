import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import { getCurrentEdition } from "@/lib/queries/edition"
import { getThemePage } from "@/lib/queries/themes"
import { EventListCard } from "@/components/events/event-list-card"
import { MarkdownContent } from "@/components/news/markdown-content"
import { Marker, SectionHeading } from "@/components/editorial/primitives"
import { htmlToMarkdown } from "@/lib/utils/markdown"
import { descriptionToPlainText, isHtmlDescription } from "@/lib/events/description"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 1800
// Fail the build instead of serving 500s if a dynamic API (headers, cookies)
// sneaks into this ISR route: on-demand renders of new slugs would crash.
export const dynamic = "error"
export const dynamicParams = true

export const generateStaticParams = async (): Promise<{ locale: string; slug: string }[]> => []

type ThemePageProps = {
  params: Promise<{ locale: string; slug: string }>
}

const findTheme = async ({ params }: ThemePageProps) => {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  return { locale, theme: await getThemePage(slug, locale, await getCurrentEdition()) }
}

export const generateMetadata = async (props: ThemePageProps): Promise<Metadata> => {
  const { theme } = await findTheme(props)
  if (!theme) return {}
  const description = theme.description
    ? descriptionToPlainText(theme.description).slice(0, 160)
    : undefined
  return {
    title: theme.name,
    description,
    openGraph: {
      title: `${theme.name} — Pierres en Lumières`,
      description,
      images: theme.coverImage ? [{ url: theme.coverImage }] : [],
    },
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/thematique/${theme.slug}`,
        en: `${BASE_URL}/en/thematique/${theme.slug}`,
      },
    },
  }
}

const LINK_CLASS =
  "text-primary hover:text-ed-amber-soft focus-visible:ring-primary/50 border-primary inline-flex min-h-11 items-center rounded-sm border-b pb-1 font-sans text-xs tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"

// Public page of a theme shown this edition (e.g. the 2027 Millennium); other themes 404.
const ThemePage = async (props: ThemePageProps) => {
  const { locale, theme } = await findTheme(props)
  if (!theme) notFound()
  setRequestLocale(locale)
  const t = await getTranslations()
  const programmeHref = `/evenements?theme=${encodeURIComponent(theme.slug)}`

  return (
    <article>
      <nav
        aria-label={t("a11y.breadcrumb")}
        className="border-primary/15 bg-background border-b px-4 py-4 md:px-6"
      >
        <ol className="text-ed-mute mx-auto flex max-w-7xl flex-wrap items-center gap-2.5 font-mono text-xs tracking-[0.16em] uppercase">
          <li>
            <Link
              href="/"
              className="hover:text-primary inline-flex items-center transition-colors"
            >
              {t("nav.home")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-primary/50">
            ›
          </li>
          <li aria-current="page" className="text-primary truncate">
            {theme.name}
          </li>
        </ol>
      </nav>

      {theme.coverImage ? (
        // Decorative banner: the theme name is the heading right below it.
        <div className="relative h-[32vh] min-h-56 w-full overflow-hidden md:h-[44vh]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={theme.coverImage}
            alt=""
            width={1200}
            height={630}
            fetchPriority="high"
            className="absolute inset-0 size-full object-cover"
          />
          <div
            className="from-ed-bg-deep/50 to-ed-bg-deep absolute inset-0 bg-gradient-to-b via-transparent"
            aria-hidden="true"
          />
        </div>
      ) : null}

      <header className="bg-ed-bg-deep border-primary/25 border-b px-4 py-14 md:px-6 md:py-16">
        <div className="mx-auto max-w-3xl">
          <Marker className="mb-4">{t("themePage.marker")}</Marker>
          <h1 className="text-foreground font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.98] font-normal tracking-[-0.025em] break-words italic">
            {theme.name}
          </h1>
          {theme.description && isHtmlDescription(theme.description) ? (
            // Same rendering as rich-text event descriptions, pages and news.
            <div className="mt-8">
              <MarkdownContent content={htmlToMarkdown(theme.description)} />
            </div>
          ) : theme.description ? (
            <div className="text-ed-bone mt-6 font-serif text-lg leading-relaxed font-light break-words md:text-xl">
              {theme.description
                .split("\n")
                .filter((paragraph) => paragraph.trim().length > 0)
                .map((paragraph, i) => (
                  <p key={i} className={i === 0 ? undefined : "mt-5"}>
                    {paragraph}
                  </p>
                ))}
            </div>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        {theme.events.length > 0 ? (
          <section aria-labelledby="theme-events">
            <SectionHeading
              marker={t("themePage.eventsMarker", { count: theme.eventCount })}
              title={<span id="theme-events">{t("themePage.eventsTitle")}</span>}
              action={
                theme.eventCount > theme.events.length ? (
                  <Link href={programmeHref} className={LINK_CLASS}>
                    {t("themePage.viewAll", { count: theme.eventCount })}
                  </Link>
                ) : null
              }
            />
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {theme.events.map((event, index) => (
                <EventListCard
                  key={event.id}
                  event={event}
                  priority={index < 3}
                  className="h-full"
                />
              ))}
            </div>
          </section>
        ) : (
          // No event of the edition yet: lead to the programme instead of an empty list.
          <p className="text-center">
            <Link href="/evenements" className={LINK_CLASS}>
              {t("themePage.browse")}
            </Link>
          </p>
        )}
      </div>
    </article>
  )
}

export default ThemePage
