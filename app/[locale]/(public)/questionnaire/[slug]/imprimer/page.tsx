import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import QRCode from "qrcode"
import { PrintButton } from "@/components/survey/print-button"
import { getPublishedSurvey } from "@/lib/queries/surveys"
import { RATING_VALUES } from "@/lib/schemas/survey"
import type { Locale } from "@/lib/i18n/config"

export const revalidate = 86400

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pierresenlumieres.fr"

type PrintPageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export const generateMetadata = async ({ params }: PrintPageProps): Promise<Metadata> => {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const survey = await getPublishedSurvey(slug, locale)
  return {
    title: survey ? `${survey.title} — version imprimable` : "Questionnaire",
    robots: { index: false, follow: false },
  }
}

const Box = ({ round }: { round?: boolean }) => (
  <span
    aria-hidden="true"
    className={`inline-block size-4 shrink-0 border-2 border-current ${round ? "rounded-full" : ""}`}
  />
)

/** Paper version: tick boxes, writing lines and a QR code to the online form. */
const SurveyPrintPage = async ({ params }: PrintPageProps) => {
  const { locale, slug } = (await params) as { locale: Locale; slug: string }
  const survey = await getPublishedSurvey(slug, locale)
  if (!survey) notFound()
  const t = await getTranslations({ locale, namespace: "survey" })

  const onlineUrl = `${BASE_URL}/${locale}/questionnaire/${slug}`
  const qrSvg = await QRCode.toString(onlineUrl, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#000000", light: "#ffffff" },
  })

  return (
    <div className="bg-white px-4 py-8 text-black md:px-10 print:p-0">
      <div className="mx-auto max-w-[21cm]">
        <div className="mb-6 flex justify-end print:hidden">
          <PrintButton label={t("printButton")} />
        </div>

        <header className="flex items-start justify-between gap-6 border-b-2 border-black pb-5">
          <div>
            <p className="font-mono text-xs tracking-[0.2em] uppercase">
              Pierres en Lumières · {t("printTitle")}
            </p>
            <h1 className="font-display mt-2 text-3xl leading-tight italic">{survey.title}</h1>
            {survey.intro && (
              <p className="mt-3 font-serif text-base whitespace-pre-line">{survey.intro}</p>
            )}
          </div>
          <figure className="w-28 shrink-0 text-center">
            <div
              role="img"
              aria-label={onlineUrl}
              className="size-28"
              dangerouslySetInnerHTML={{ __html: qrSvg }}
            />
            <figcaption className="mt-1 font-sans text-[10px] leading-tight">
              {t("printQr")}
            </figcaption>
          </figure>
        </header>

        <p className="mt-4 font-sans text-sm">{t("printHint")}</p>

        <ol className="mt-6 space-y-7">
          {survey.questions.map((question, index) => (
            <li key={question.id} className="break-inside-avoid">
              <p className="font-serif text-lg font-semibold">
                {index + 1}. {question.label}
                {question.required && " *"}
                {question.type === "multiple" && (
                  <span className="font-sans text-sm font-normal"> ({t("printMultiple")})</span>
                )}
              </p>
              {question.type === "text" && (
                <div className="mt-3 space-y-6" aria-hidden="true">
                  {[0, 1, 2].map((line) => (
                    <div key={line} className="border-b border-black/50" />
                  ))}
                </div>
              )}
              {question.type === "rating" && (
                <div className="mt-3">
                  <p className="font-sans text-xs">{t("ratingLegend")}</p>
                  <ul className="mt-2 flex gap-6">
                    {RATING_VALUES.map((value) => (
                      <li key={value} className="flex items-center gap-2 font-sans text-base">
                        <Box round />
                        {value}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(question.type === "single" || question.type === "multiple") && (
                <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2">
                  {question.options.map((option) => (
                    <li key={option.id} className="flex items-center gap-2 font-serif text-base">
                      <Box round={question.type === "single"} />
                      {option.label}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>

        <p className="mt-10 border-t border-black pt-4 text-center font-serif text-base italic">
          {t("printThanks")}
        </p>
      </div>
    </div>
  )
}

export default SurveyPrintPage
