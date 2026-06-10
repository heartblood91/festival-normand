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
  const page = await getPageBySlug("mentions-legales", locale)
  const title = page?.title ?? (locale === "en" ? "Legal notice" : "Mentions légales")
  const description =
    locale === "en"
      ? "Legal notice of the Pierres en Lumières website — publisher information, hosting, intellectual property and personal data."
      : "Mentions légales du site Pierres en Lumières — informations éditeur, hébergement, propriété intellectuelle et données personnelles."

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
  const { locale } = (await params) as { locale: Locale }
  const page = await getPageBySlug("mentions-legales", locale)

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

export default MentionsLegalesPage
