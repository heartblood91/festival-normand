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
  const page = await getPageBySlug("accessibilite", locale)
  const title =
    page?.title ?? (locale === "en" ? "Accessibility Statement" : "Déclaration d'accessibilité")
  const description =
    locale === "en"
      ? "Accessibility statement for the Pierres en Lumières website in accordance with RGAA 4.1."
      : "Déclaration d'accessibilité du site Pierres en Lumières conformément au RGAA 4.1."

  return {
    title,
    description,
    openGraph: {
      title: `${title} — Pierres en Lumières`,
      description,
    },
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/accessibilite`,
        en: `${BASE_URL}/en/accessibilite`,
      },
    },
  }
}

type AccessibilitePageProps = {
  params: Promise<{ locale: string }>
}

const AccessibilitePage = async ({ params }: AccessibilitePageProps) => {
  const { locale } = (await params) as { locale: Locale }
  const page = await getPageBySlug("accessibilite", locale)

  if (!page) {
    notFound()
  }

  return (
    <ClassicPage
      title={page.title}
      content={page.content}
      marker={locale === "en" ? "Information page" : "Page d'information"}
    />
  )
}

export default AccessibilitePage
