import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { Marker } from "@/components/editorial/primitives"
import { SurveyForm } from "@/components/survey/survey-form"
import { getPublishedSurvey } from "@/lib/queries/surveys"
import type { Locale } from "@/lib/i18n/config"

export const revalidate = 86400

type SurveyPageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export const generateMetadata = async ({ params }: SurveyPageProps): Promise<Metadata> => {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const survey = await getPublishedSurvey(slug, locale)
  return {
    title: survey?.title ?? "Questionnaire",
    description: survey?.intro || undefined,
    // A survey is reached by its QR code or link, not by search.
    robots: { index: false, follow: true },
  }
}

const SurveyPage = async ({ params }: SurveyPageProps) => {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const survey = await getPublishedSurvey(slug, locale)
  if (!survey) notFound()
  const t = await getTranslations({ locale, namespace: "survey" })

  return (
    <div>
      <div className="bg-ed-bg-deep border-primary/25 border-b px-4 py-14 md:px-6 md:py-20">
        <div className="mx-auto max-w-3xl">
          <Marker className="mb-5">{t("marker")}</Marker>
          <h1 className="text-foreground font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[1] font-normal tracking-[-0.02em] italic">
            {survey.title}
          </h1>
          {survey.intro && (
            <p className="text-ed-bone mt-6 font-serif text-xl font-light whitespace-pre-line italic">
              {survey.intro}
            </p>
          )}
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        <SurveyForm survey={survey} locale={locale} />
      </div>
    </div>
  )
}

export default SurveyPage
