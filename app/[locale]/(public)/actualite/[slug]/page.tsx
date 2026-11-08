import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Link } from "@/lib/i18n/routing"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { getNewsBySlug } from "@/lib/queries/news"
import { MarkdownContent } from "@/components/news/markdown-content"
import { Marker } from "@/components/editorial/primitives"
import { formatFullDate } from "@/lib/utils/format-date"
import { prisma } from "@/lib/prisma"
import { locales } from "@/lib/i18n/config"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 1800
// Fail the build instead of serving 500s if a dynamic API (headers, cookies)
// sneaks into this ISR route: on-demand renders of new slugs would crash.
export const dynamic = "error"

export const generateStaticParams = async () => {
  const news = await prisma.news.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return locales.flatMap((locale) => news.map((n: { slug: string }) => ({ locale, slug: n.slug })))
}

type NewsDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export const generateMetadata = async ({ params }: NewsDetailPageProps): Promise<Metadata> => {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const article = await getNewsBySlug(slug, locale)

  if (!article) {
    return { title: "Article introuvable" }
  }

  return {
    title: article.title,
    description: article.excerpt ?? article.content.slice(0, 160),
    openGraph: {
      title: article.title,
      description: article.excerpt ?? article.content.slice(0, 160),
      images: article.coverImage ? [{ url: article.coverImage }] : [],
      type: "article",
      publishedTime: article.publishedAt ?? undefined,
    },
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/actualite/${slug}`,
        en: `${BASE_URL}/en/actualite/${slug}`,
      },
    },
  }
}

const NewsDetailPage = async ({ params }: NewsDetailPageProps) => {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  setRequestLocale(locale)
  const t = await getTranslations()
  const article = await getNewsBySlug(slug, locale)

  if (!article) {
    notFound()
  }

  return (
    <article>
      {/* Breadcrumb */}
      <nav
        aria-label={t("a11y.breadcrumb")}
        className="border-primary/15 bg-background border-b px-4 py-4 md:px-6"
      >
        <ol className="text-ed-mute mx-auto flex max-w-3xl flex-wrap items-center gap-2.5 font-mono text-[10.5px] tracking-[0.16em] uppercase">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              {t("news.breadcrumbHome")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-primary/50">
            ›
          </li>
          <li>
            <Link href="/actualites" className="hover:text-primary transition-colors">
              {t("news.breadcrumbNews")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-primary/50">
            ›
          </li>
          <li aria-current="page" className="text-primary truncate">
            {article.title}
          </li>
        </ol>
      </nav>

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <header className="mb-10">
          <Marker className="mb-5">{t("news.title")}</Marker>
          <h1 className="text-foreground font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1.0] font-normal tracking-[-0.025em] italic">
            {article.title}
          </h1>
          {article.publishedAt ? (
            <time
              dateTime={article.publishedAt}
              className="text-ed-mute mt-6 block font-mono text-[11px] tracking-[0.18em] uppercase"
            >
              {formatFullDate(article.publishedAt, locale)}
            </time>
          ) : null}
        </header>

        {article.coverImage ? (
          <div className="border-primary/20 relative mb-10 aspect-[16/9] w-full overflow-hidden border">
            <Image
              src={article.coverImage}
              alt={article.coverImageAlt || article.title}
              fill
              sizes="(max-width: 1024px) 100vw, 768px"
              className="object-cover"
              priority
            />
          </div>
        ) : null}

        <MarkdownContent content={article.content} />
      </div>
    </article>
  )
}

export default NewsDetailPage
