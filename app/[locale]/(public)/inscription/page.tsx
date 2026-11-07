import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import { getPageBySlug } from "@/lib/queries/pages"
import { getCurrentEdition } from "@/lib/queries/edition"
import { ClassicPage } from "@/components/editorial/classic-page"
import { DepartmentRegistrationLinks } from "@/components/inscription/department-registration-links"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 86400

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> => {
  const { locale } = (await params) as { locale: Locale }
  const [page, { year }] = await Promise.all([
    getPageBySlug("inscription", locale),
    getCurrentEdition(),
  ])
  const title = page?.title ?? (locale === "en" ? "How to register?" : "Comment vous inscrire ?")
  const description =
    locale === "en"
      ? `Register your heritage site to participate in Pierres en Lumières ${year}, the free Norman heritage festival.`
      : `Inscrivez votre site patrimonial pour participer à Pierres en Lumières ${year}, le festival gratuit du patrimoine normand.`

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
  const { locale } = (await params) as { locale: Locale }
  const page = await getPageBySlug("inscription", locale)

  if (!page) {
    notFound()
  }

  return (
    <ClassicPage
      title={page.title}
      content={page.content}
      marker={locale === "en" ? "Take part" : "Participer"}
    >
      <DepartmentRegistrationLinks />
    </ClassicPage>
  )
}

export default InscriptionPage
