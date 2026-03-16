import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/queries/pages"
import { MarkdownContent } from "@/components/news/markdown-content"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Inscrivez votre événement",
  description:
    "Inscrivez votre site patrimonial pour participer à Pierres en Lumières 2026, le festival gratuit du patrimoine normand.",
  openGraph: {
    title: "Inscrivez votre événement — Pierres en Lumières",
    description:
      "Participez à Pierres en Lumières 2026 en inscrivant votre site patrimonial normand. Inscription gratuite et ouverte à tous.",
  },
}

const InscriptionPage = async () => {
  const page = await getPageBySlug("inscription")

  if (!page) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 md:py-12 lg:py-16">
      <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-8">
        Inscrivez votre événement
      </h1>
      <MarkdownContent content={page.content} />
    </article>
  )
}

export default InscriptionPage
