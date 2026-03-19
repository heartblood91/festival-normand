import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/queries/pages"
import { MarkdownContent } from "@/components/news/markdown-content"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 86400

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
  const { locale } = await params
  const frenchTitle = "Inscrivez votre événement"
  const englishTitle = "Register Your Event"
  const frenchDesc = "Inscrivez votre site patrimonial pour participer à Pierres en Lumières 2026, le festival gratuit du patrimoine normand."
  const englishDesc = "Register your heritage site to participate in Stones in Lights 2026, the free festival of Norman heritage."

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
        fr: `${BASE_URL}/fr/inscription`,
        en: `${BASE_URL}/en/inscription`,
      },
    },
  }
}

type InscriptionPageProps = {
  params: Promise<{ locale: string }>
}

const InscriptionPage = async ({ params }: InscriptionPageProps) => {
  const { locale } = await params
  const page = await getPageBySlug("inscription", locale)

  if (!page) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 md:py-12 lg:py-16">
      <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl mb-8">
        {locale === "en" ? "Register your event" : "Inscrivez votre événement"}
      </h1>
      <MarkdownContent content={page.content} />
    </article>
  )
}

export default InscriptionPage
