import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { getPageBySlug } from "@/lib/queries/pages"
import { PAGE_SLUG_PATTERN } from "@/lib/schemas/page"
import { ClassicPage } from "@/components/editorial/classic-page"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 86400

type CmsPageProps = {
  params: Promise<{ locale: string; rest: string[] }>
}

// Pages created in /admin/pages live at /{slug}; any other unknown URL ends in the
// public not-found page, inside the site layout. URLs that cannot be a slug
// (bot probes such as /wp-login.php) skip the database.
const findPage = async ({ params }: CmsPageProps) => {
  const { locale, rest } = (await params) as { locale: Locale; rest: string[] }
  return rest.length === 1 && PAGE_SLUG_PATTERN.test(rest[0])
    ? getPageBySlug(rest[0], locale)
    : null
}

export const generateMetadata = async (props: CmsPageProps): Promise<Metadata> => {
  const page = await findPage(props)
  if (!page) return {}
  return {
    title: page.title,
    openGraph: { title: `${page.title} — Pierres en Lumières` },
    alternates: {
      languages: {
        fr: `${BASE_URL}/fr/${page.slug}`,
        en: `${BASE_URL}/en/${page.slug}`,
      },
    },
  }
}

const CmsPage = async (props: CmsPageProps) => {
  const page = await findPage(props)
  if (!page) notFound()
  const t = await getTranslations()
  return <ClassicPage title={page.title} content={page.content} marker={t("meta.siteName")} />
}

export default CmsPage
