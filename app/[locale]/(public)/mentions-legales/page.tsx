import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/queries/pages"
import { MarkdownContent } from "@/components/news/markdown-content"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 86400

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
  const { locale } = await params
  const frenchTitle = "Mentions légales"
  const englishTitle = "Legal Notice"
  const frenchDesc = "Mentions légales du site Pierres en Lumières — informations éditeur, hébergement, propriété intellectuelle et données personnelles."
  const englishDesc = "Legal notice of the Stones in Lights website — publisher information, hosting, intellectual property and personal data."

  const title = locale === "en" ? englishTitle : frenchTitle
  const description = locale === "en" ? englishDesc : frenchDesc

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Pierres en Lumières`,
      description,
    },
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/mentions-legales`,
        en: `${BASE_URL}/en/mentions-legales`,
      },
    },
  }
}

type MentionsLegalesPageProps = {
  params: Promise<{ locale: string }>
}

const MentionsLegalesPage = async ({ params }: MentionsLegalesPageProps) => {
  const { locale } = await params
  const page = await getPageBySlug("mentions-legales", locale)

  if (!page) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 md:py-12 lg:py-16">
      <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-8">
        {locale === "en" ? "Legal notice" : "Mentions légales"}
      </h1>
      <MarkdownContent content={page.content} />
    </article>
  )
}

export default MentionsLegalesPage
