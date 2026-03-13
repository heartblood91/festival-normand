import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/queries/pages"
import { MarkdownContent } from "@/components/news/markdown-content"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Le Festival",
  description:
    "Découvrez Pierres en Lumières, le festival gratuit qui illumine le patrimoine normand chaque année dans les cinq départements de Normandie.",
  openGraph: {
    title: "Le Festival Pierres en Lumières",
    description:
      "Un événement festif et culturel, gratuit et ouvert à tous, qui met en valeur le patrimoine normand à travers des illuminations, animations, visites et expositions.",
  },
}

const FestivalPage = async () => {
  const page = await getPageBySlug("festival")

  if (!page) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 md:py-12 lg:py-16">
      <MarkdownContent content={page.content} />
    </article>
  )
}

export default FestivalPage
