import type { Metadata } from "next"
import { getNews } from "@/lib/queries/news"
import { NewsCard } from "@/components/news/news-card"

export const revalidate = 600

export const metadata: Metadata = {
  title: "Actualités",
  description:
    "Les dernières actualités du festival Pierres en Lumières. Programme, nouveautés, reportages et informations pratiques.",
  openGraph: {
    title: "Actualités - Pierres en Lumières",
    description:
      "Les dernières actualités du festival Pierres en Lumières. Programme, nouveautés, reportages et informations pratiques.",
  },
}

const NewsListPage = async () => {
  const articles = await getNews()

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12 lg:py-16">
      {/* Page header */}
      <div className="mb-8 md:mb-10">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
          Actualités
        </h1>
        <p className="mt-2 text-muted-foreground md:text-lg">
          Les dernières nouvelles du festival Pierres en Lumières
        </p>
      </div>

      {/* News grid */}
      {articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 py-16 text-center">
          <p className="font-serif text-xl font-bold text-foreground">
            Aucune actualité pour le moment
          </p>
          <p className="mt-2 text-muted-foreground">
            Revenez bientôt pour découvrir les dernières nouvelles du festival
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {articles.map((article, index) => (
            <NewsCard key={article.id} article={article} priority={index < 3} />
          ))}
        </div>
      )}
    </div>
  )
}

export default NewsListPage
