import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/queries/pages"
import { ClassicPage } from "@/components/editorial/classic-page"

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

  if (!page) {
    notFound()
  }

  return (
    <ClassicPage
      title={page.title}
      content={page.content}
      marker={locale === "en" ? "The festival · since 2009" : "Le festival · depuis 2009"}
    />
  )
}

export default FestivalPage
