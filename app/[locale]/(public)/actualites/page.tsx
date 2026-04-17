import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { getTranslations } from "next-intl/server"
import { getNews, type NewsListItem } from "@/lib/queries/news"
import { NewsCard } from "@/components/news/news-card"

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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 lg:py-16">
      <div className="mb-8 md:mb-10">
        <h1 className="text-foreground font-serif text-3xl font-bold md:text-4xl lg:text-5xl">
          {t("news.title")}
        </h1>
        <p className="text-muted-foreground mt-2 md:text-lg">{t("news.subtitle")}</p>
      </div>

      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center">
          <p className="text-foreground font-serif text-xl font-bold">{t("news.noResults")}</p>
          <p className="text-muted-foreground mt-2">{t("news.noResultsHint")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {articles.map((article: NewsListItem, index: number) => (
            <NewsCard key={article.id} article={article} priority={index < 3} />
          ))}
        </div>
      )}
    </div>
  )
}

export default NewsListPage
