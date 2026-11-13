import { cachedQuery } from "@/lib/cache"
import { prisma } from "@/lib/prisma"
import { readQuestions } from "@/lib/schemas/survey"
import type { Locale } from "@/lib/i18n/config"

export type PublicSurveyQuestion = {
  id: string
  type: "single" | "multiple" | "rating" | "text"
  label: string
  required: boolean
  options: { id: string; label: string }[]
}

export type PublicSurvey = {
  slug: string
  title: string
  intro: string
  questions: PublicSurveyQuestion[]
}

const pick = (locale: Locale, fr: string, en?: string | null) => (locale === "en" && en ? en : fr)

/** A published survey in the visitor's language, English falling back to French. */
export const getPublishedSurvey = (slug: string, locale: Locale) =>
  cachedQuery(
    async (): Promise<PublicSurvey | null> => {
      const survey = await prisma.survey.findFirst({
        where: { slug, published: true },
        select: {
          slug: true,
          titleFr: true,
          titleEn: true,
          introFr: true,
          introEn: true,
          questions: true,
        },
      })
      if (!survey) return null
      return {
        slug: survey.slug,
        title: pick(locale, survey.titleFr, survey.titleEn),
        intro: pick(locale, survey.introFr ?? "", survey.introEn),
        questions: readQuestions(survey.questions).map((question) => ({
          id: question.id,
          type: question.type,
          label: pick(locale, question.labelFr, question.labelEn),
          required: question.required,
          options: question.options.map((option) => ({
            id: option.id,
            label: pick(locale, option.labelFr, option.labelEn),
          })),
        })),
      }
    },
    ["survey", slug, locale],
    { revalidate: 86400, tags: ["surveys"] }
  )()
