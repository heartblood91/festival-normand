import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import Image from "next/image"
import { Link } from "@/lib/i18n/routing"
import { getTranslations } from "next-intl/server"
import { getNews, type NewsListItem } from "@/lib/queries/news"
import { NewsCard } from "@/components/news/news-card"
import { Marker } from "@/components/editorial/primitives"
import { formatNewsDate } from "@/lib/utils/format-date"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 600

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = (await params) as { locale: Locale }
  const t = await getTranslations({ locale })

  return {
    title: t("news.title"),
    description: t("news.subtitle"),
    openGraph: {
      title: `${t("news.title")} — Pierres en Lumières`,
      description: t("news.subtitle"),
    },
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/actualites`,
        en: `${BASE_URL}/en/actualites`,
      },
    },
  }
}

type NewsListPageProps = {
  params: Promise<{ locale: string }>
}

const NewsListPage = async ({ params }: NewsListPageProps) => {
  const { locale } = (await params) as { locale: Locale }
  const t = await getTranslations()
  const articles = await getNews(locale)
  const [featured, ...rest] = articles

  return (
    <div>
      {/* Header */}
      <div className="bg-ed-bg-deep border-primary/25 border-b px-4 py-14 md:px-6 md:py-16">
        <div className="mx-auto max-w-7xl">
          <Marker className="mb-4">{t("news.title")}</Marker>
          <h1 className="text-foreground font-display max-w-3xl text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.98] font-normal tracking-[-0.025em] italic">
            {t("news.subtitle")}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        {articles.length === 0 ? (
          <div className="border-primary/20 bg-ed-bg-soft flex flex-col items-center justify-center border px-6 py-20 text-center">
            <p className="text-foreground font-display text-2xl font-normal italic">
              {t("news.noResults")}
            </p>
            <p className="text-ed-bone mt-2 font-serif">{t("news.noResultsHint")}</p>
          </div>
        ) : (
          <>
            {/* Featured article */}
            {featured ? (
              <Link
                href={`/actualite/${featured.slug}`}
                className="group bg-ed-bg-soft border-primary/25 hover:border-primary/50 focus-visible:ring-primary/50 mb-12 grid overflow-hidden border transition-colors focus-visible:ring-2 focus-visible:outline-none md:mb-16 lg:grid-cols-[1.15fr_1fr]"
              >
                <div className="bg-ed-bg-deep relative aspect-[16/10] w-full overflow-hidden lg:aspect-auto lg:min-h-[22rem]">
                  {featured.coverImage ? (
                    <Image
                      src={featured.coverImage}
                      alt={featured.coverImageAlt || featured.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 55vw"
                      className="object-cover"
                      priority
                    />
                  ) : null}
                </div>
                <div className="flex flex-col justify-center gap-5 p-8 md:p-10">
                  <span className="bg-primary text-primary-foreground w-fit px-3 py-1 font-sans text-[10px] font-semibold tracking-[0.16em] uppercase">
                    {locale === "en" ? "Featured" : "À la une"}
                  </span>
                  {featured.publishedAt ? (
                    <time
                      dateTime={new Date(featured.publishedAt).toISOString()}
                      className="text-primary font-mono text-[10.5px] tracking-[0.18em] uppercase"
                    >
                      {formatNewsDate(featured.publishedAt, locale)}
                    </time>
                  ) : null}
                  <h2 className="text-foreground group-hover:text-primary font-display text-3xl leading-[1.05] font-normal tracking-tight italic transition-colors md:text-4xl">
                    {featured.title}
                  </h2>
                  {featured.excerpt ? (
                    <p className="text-ed-bone font-serif text-lg font-light">{featured.excerpt}</p>
                  ) : null}
                  <span className="text-primary border-primary inline-flex w-fit items-center border-b pb-1 font-sans text-xs tracking-[0.16em] uppercase">
                    {t("editorial.readArticle")} →
                  </span>
                </div>
              </Link>
            ) : null}

            {/* Grid */}
            {rest.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((article: NewsListItem, index: number) => (
                  <NewsCard key={article.id} article={article} priority={index < 3} />
                ))}
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}

export default NewsListPage
