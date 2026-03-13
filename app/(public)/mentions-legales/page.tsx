import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/queries/pages"
import { MarkdownContent } from "@/components/news/markdown-content"

export const revalidate = 86400

export const metadata: Metadata = {
  title: "Mentions légales",
  description:
    "Mentions légales du site Pierres en Lumières — informations éditeur, hébergement, propriété intellectuelle et données personnelles.",
  openGraph: {
    title: "Mentions légales — Pierres en Lumières",
    description:
      "Mentions légales du site Pierres en Lumières.",
  },
}

const MentionsLegalesPage = async () => {
  const page = await getPageBySlug("mentions-legales")

  if (!page) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 md:py-12 lg:py-16">
      <MarkdownContent content={page.content} />
    </article>
  )
}

export default MentionsLegalesPage
