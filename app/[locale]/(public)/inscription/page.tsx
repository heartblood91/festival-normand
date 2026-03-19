import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/queries/pages"
import { getTranslations } from "next-intl/server"
import { MarkdownContent } from "@/components/news/markdown-content"
import { Breadcrumb } from "@/components/ui/breadcrumb"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 86400

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
  const { locale } = await params as { locale: Locale }
  const page = await getPageBySlug("inscription", locale)
  const title = page?.title ?? (locale === "en" ? "How to register?" : "Comment vous inscrire ?")
  const description = locale === "en"
    ? "Register your heritage site to participate in Pierres en Lumières 2026, the free Norman heritage festival."
    : "Inscrivez votre site patrimonial pour participer à Pierres en Lumières 2026, le festival gratuit du patrimoine normand."

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
  const { locale } = await params as { locale: Locale }
  const page = await getPageBySlug("inscription", locale)
  const t = await getTranslations()

  if (!page) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 md:py-12 lg:py-16">
      <Breadcrumb
        ariaLabel={t("a11y.breadcrumb")}
        items={[
          { label: t("nav.home"), href: `/${locale}` },
          { label: page.title },
        ]}
      />
      <h1 className="mb-8 font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
        {page.title}
      </h1>
      <MarkdownContent content={page.content} />
    </article>
  )
}

export default InscriptionPage
