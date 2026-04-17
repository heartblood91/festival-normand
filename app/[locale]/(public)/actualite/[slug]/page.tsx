import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { getNewsBySlug } from "@/lib/queries/news"
import { MarkdownContent } from "@/components/news/markdown-content"
import { prisma } from "@/lib/prisma"
import { locales } from "@/lib/i18n/config"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 1800

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

const formatNewsDate = (date: Date | string, locale: string): string => {
  const localeStr = locale === "en" ? "en-US" : "fr-FR"
  return new Intl.DateTimeFormat(localeStr, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
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
  const t = await getTranslations()
  const article = await getNewsBySlug(slug, locale)

  if (!article) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 md:py-12 lg:py-16">
      {/* Breadcrumb */}
      <nav aria-label="Fil d'Ariane" className="mb-6">
        <ol className="text-muted-foreground flex flex-wrap items-center gap-2 text-sm">
          <li>
            <Link
              href={`/${locale}`}
              className="hover:text-foreground focus-visible:ring-primary/50 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("news.breadcrumbHome")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-foreground/50">
            /
          </li>
          <li>
            <Link
              href={`/${locale}/actualites`}
              className="hover:text-foreground focus-visible:ring-primary/50 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("news.breadcrumbNews")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-muted-foreground/50">
            /
          </li>
          <li aria-current="page" className="text-foreground font-medium">
            {article.title}
          </li>
        </ol>
      </nav>

      {/* Back link */}
      <Link
        href={`/${locale}/actualites`}
        className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 mb-6 inline-flex items-center gap-2 text-sm transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {t("news.backToNews")}
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="text-foreground font-serif text-3xl font-bold md:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        <div className="text-muted-foreground mt-4 flex items-center gap-2 text-sm">
          <Calendar className="size-4 shrink-0" aria-hidden="true" />
          <time dateTime={article.publishedAt ?? ""}>
            {article.publishedAt ? formatNewsDate(article.publishedAt, locale) : ""}
          </time>
        </div>
      </header>

      {/* Cover image */}
      {article.coverImage && (
        <div className="from-primary/20 to-primary/5 mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gradient-to-br">
          <img
            src={article.coverImage}
            alt={article.title}
            width={896}
            height={504}
            className="h-full w-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </div>
      )}

      {/* Article content */}
      <MarkdownContent content={article.content} />
    </article>
  )
}

export default NewsDetailPage
