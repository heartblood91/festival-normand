import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import { ArrowLeft, Calendar } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { localizeEntity } from "@/lib/i18n/db"
import { PreviewBar } from "@/components/admin/preview-bar"
import { MarkdownContent } from "@/components/news/markdown-content"

type NewsPreviewPageProps = {
  params: Promise<{ locale: string; id: string }>
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

const NewsPreviewPage = async ({ params }: NewsPreviewPageProps) => {
  const { locale, id } = (await params) as { locale: Locale; id: string }
  const t = await getTranslations()

  const rawArticle = await prisma.news.findUnique({
    where: { id },
  })

  if (!rawArticle) {
    notFound()
  }

  const article = {
    ...localizeEntity(rawArticle, locale, ["title", "excerpt", "content"]),
    publishedAt: rawArticle.publishedAt?.toISOString() ?? null,
  }

  return (
    <>
      <PreviewBar backUrl={`/admin/news/${id}/edit`} />
      <article className="mx-auto max-w-4xl px-4 py-8 pt-20 md:py-12 lg:py-16">
        {/* Back link */}
        <a
          href={`/admin/news/${id}/edit`}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 mb-6 inline-flex items-center gap-2 text-sm transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t("news.backToNews")}
        </a>

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
    </>
  )
}

export default NewsPreviewPage
