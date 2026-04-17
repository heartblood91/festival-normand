import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/queries/pages"
import { getTranslations } from "next-intl/server"
import { MarkdownContent } from "@/components/news/markdown-content"
import { Breadcrumb } from "@/components/ui/breadcrumb"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 86400

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = (await params) as { locale: Locale }
  const page = await getPageBySlug("festival", locale)
  const title = page?.title ?? (locale === "en" ? "The Festival" : "Le Festival")
  const description =
    locale === "en"
      ? "Discover Pierres en Lumières, the free festival that illuminates Norman heritage every year across Normandy's five departments."
      : "Découvrez Pierres en Lumières, le festival gratuit qui illumine le patrimoine normand chaque année dans les cinq départements de Normandie."

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Pierres en Lumières`,
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
  const { locale } = (await params) as { locale: Locale }
  const page = await getPageBySlug("festival", locale)
  const t = await getTranslations()

  if (!page) {
    notFound()
  }

  return (
    <article className="mx-auto max-w-4xl px-4 py-8 md:py-12 lg:py-16">
      <Breadcrumb
        ariaLabel={t("a11y.breadcrumb")}
        items={[{ label: t("nav.home"), href: `/${locale}` }, { label: page.title }]}
      />
      <h1 className="text-foreground mb-8 font-serif text-3xl font-bold md:text-4xl lg:text-5xl">
        {page.title}
      </h1>
      <MarkdownContent content={page.content} />
    </article>
  )
}

export default FestivalPage
