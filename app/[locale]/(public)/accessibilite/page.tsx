import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { accessibilityDeclaration } from "@/lib/accessibility/declaration"
import { ClassicPage } from "@/components/editorial/classic-page"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = (await params) as { locale: Locale }
  const { title } = accessibilityDeclaration(locale)
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

// Generated from lib/accessibility/declaration.ts, not from the CMS page of the same
// slug: the statement must match the tests actually run on the site.
const AccessibilitePage = async ({ params }: AccessibilitePageProps) => {
  const { locale } = (await params) as { locale: Locale }
  const { title, content } = accessibilityDeclaration(locale)

  return (
    <ClassicPage
      title={title}
      content={content}
      marker={locale === "en" ? "Information page" : "Page d'information"}
    />
  )
}

export default AccessibilitePage
