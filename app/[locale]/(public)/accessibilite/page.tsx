import type { Metadata } from "next"
import type { Locale } from "@/lib/i18n/config"
import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Breadcrumb } from "@/components/ui/breadcrumb"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

export const revalidate = 86400

export const generateMetadata = async ({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> => {
  const { locale } = await params as { locale: Locale }
  const t = await getTranslations({ locale })

  return {
    title: t("accessibilityPage.title"),
    description: t("accessibilityPage.description"),
    openGraph: {
      title: `${t("accessibilityPage.title")} — Pierres en Lumières`,
      description: t("accessibilityPage.description"),
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
  const { locale } = await params as { locale: Locale }
  const t = await getTranslations()

  return (
  <div className="mx-auto max-w-3xl px-4 py-12 md:py-16">
    <Breadcrumb
      ariaLabel={t("a11y.breadcrumb")}
      items={[
        { label: t("nav.home"), href: `/${locale}` },
        { label: t("accessibilityPage.title") },
      ]}
    />
    <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
      {t("accessibilityPage.title")}
    </h1>

    <div className="mt-8 space-y-6 text-muted-foreground">
      <p>{t("accessibilityPage.intro")}</p>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {t("accessibilityPage.conformityTitle")}
        </h2>
        <p className="mt-2">
          {t.rich("accessibilityPage.conformityText", {
            bold: (chunks) => <strong className="text-foreground">{chunks}</strong>,
          })}
        </p>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {t("accessibilityPage.nonAccessibleTitle")}
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-6">
          <li>{t("accessibilityPage.nonAccessible1")}</li>
          <li>{t("accessibilityPage.nonAccessible2")}</li>
        </ul>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {t("accessibilityPage.measuresTitle")}
        </h2>
        <ul className="mt-2 list-disc space-y-2 pl-6">
          <li>{t("accessibilityPage.measure1")}</li>
          <li>{t("accessibilityPage.measure2")}</li>
          <li>{t("accessibilityPage.measure3")}</li>
          <li>{t("accessibilityPage.measure4")}</li>
          <li>{t("accessibilityPage.measure5")}</li>
          <li>{t("accessibilityPage.measure6")}</li>
          <li>{t("accessibilityPage.measure7")}</li>
          <li>{t("accessibilityPage.measure8")}</li>
          <li>{t("accessibilityPage.measure9")}</li>
        </ul>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {t("accessibilityPage.feedbackTitle")}
        </h2>
        <p className="mt-2">{t("accessibilityPage.feedbackText")}</p>
        <p className="mt-2">
          {t("accessibilityPage.feedbackContact")}
          <Link href={`/${locale}/contact`} className="text-primary underline hover:text-primary/80">
            {t("accessibilityPage.feedbackLink")}
          </Link>
          .
        </p>
      </div>

      <div>
        <h2 className="font-serif text-xl font-bold text-foreground">
          {t("accessibilityPage.recourseTitle")}
        </h2>
        <p className="mt-2">{t("accessibilityPage.recourseText")}</p>
      </div>

      <p className="text-sm">{t("accessibilityPage.lastUpdated")}</p>
    </div>
  </div>
  )
}

export default AccessibilitePage
