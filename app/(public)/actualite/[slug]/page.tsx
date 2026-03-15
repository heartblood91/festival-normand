import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar } from "lucide-react"
import { getNewsBySlug } from "@/lib/queries/news"
import { MarkdownContent } from "@/components/news/markdown-content"
import { prisma } from "@/lib/prisma"

export const revalidate = 1800

export const generateStaticParams = async () => {
  const news = await prisma.news.findMany({
    where: { published: true },
    select: { slug: true },
  })
  return news.map((n) => ({ slug: n.slug }))
}

type NewsDetailPageProps = {
  params: Promise<{ slug: string }>
}

const formatNewsDate = (date: Date | string): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

export const generateMetadata = async ({ params }: NewsDetailPageProps): Promise<Metadata> => {
  const { slug } = await params
  const article = await getNewsBySlug(slug)

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
      publishedTime: article.publishedAt.toISOString(),
    },
  }
}

const NewsDetailPage = async ({ params }: NewsDetailPageProps) => {
  const { slug } = await params
  const article = await getNewsBySlug(slug)

  if (!article) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 md:py-12 lg:py-16">
      {/* Back link */}
      <Link
        href="/actualites"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:rounded-sm"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Retour aux actualités
      </Link>

      {/* Header */}
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="size-4 shrink-0" aria-hidden="true" />
          <time dateTime={article.publishedAt.toISOString()}>
            {formatNewsDate(article.publishedAt)}
          </time>
        </div>
      </header>

      {/* Cover image */}
      {article.coverImage && (
        <div className="mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Article content */}
      <MarkdownContent content={article.content} />
    </article>
  )
}

export default NewsDetailPage
