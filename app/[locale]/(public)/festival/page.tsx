import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/queries/pages"
import { MarkdownContent } from "@/components/news/markdown-content"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 86400

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
  const { locale } = await params
  const frenchTitle = "Le Festival"
  const englishTitle = "The Festival"
  const frenchDesc = "Découvrez Pierres en Lumières, le festival gratuit qui illumine le patrimoine normand chaque année dans les cinq départements de Normandie."
  const englishDesc = "Discover Stones in Lights, the free festival that illuminates Norman heritage every year across Normandy's five departments."

  const title = locale === "en" ? englishTitle : frenchTitle
  const description = locale === "en" ? englishDesc : frenchDesc

  return {
    title,
    description,
    openGraph: {
      title: `${title} - Pierres en Lumières`,
      description,
    },
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/festival`,
        en: `${BASE_URL}/en/festival`,
      },
    },
  }
}

type FestivalPageProps = {
  params: Promise<{ locale: string }>
}

const FestivalPage = async ({ params }: FestivalPageProps) => {
  const { locale } = await params
  const page = await getPageBySlug("festival", locale)

  if (!page) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 md:py-12 lg:py-16">
      <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-8">
        {locale === "en" ? "The Festival" : "Le Festival"}
      </h1>
      <MarkdownContent content={page.content} />
    </article>
  )
}

export default FestivalPage
