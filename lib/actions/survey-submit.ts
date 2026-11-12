"use server"

import { prisma } from "@/lib/prisma"
import { clientKey, createRateLimiter } from "@/lib/rate-limit"
import { collectAnswers, readQuestions, type AnswerError } from "@/lib/schemas/survey"
import { locales, type Locale } from "@/lib/i18n/config"

export type SurveySubmitResult = {
  status: "idle" | "sent" | "invalid" | "error" | "limited"
  errors?: Record<string, AnswerError>
}

// Paper QR codes send whole groups through one venue network, so the limit
// is generous: it only stops a script from flooding the results.
const RATE_LIMIT_WINDOW_MS = 10 * 60_000
const RATE_LIMIT_MAX = 20
const isRateLimited = createRateLimiter({ windowMs: RATE_LIMIT_WINDOW_MS, max: RATE_LIMIT_MAX })

/** Public, anonymous: stores one response to a published survey. */
export const submitSurveyResponse = async (
  slug: string,
  locale: string,
  _prev: SurveySubmitResult,
  formData: FormData
): Promise<SurveySubmitResult> => {
  // Bots filling the hidden field get the same answer as people.
  if (formData.get("website")) return { status: "sent" }

  try {
    const survey = await prisma.survey.findFirst({
      where: { slug, published: true },
      select: { id: true, questions: true },
    })
    if (!survey) return { status: "error" }

    const questions = readQuestions(survey.questions)
    const { answers, errors } = collectAnswers(questions, (name) =>
      formData.getAll(name).filter((value): value is string => typeof value === "string")
    )
    if (Object.keys(errors).length) return { status: "invalid", errors }
    if (!Object.keys(answers).length) return { status: "invalid", errors: {} }

    if (isRateLimited(await clientKey())) return { status: "limited" }

    await prisma.surveyResponse.create({
      data: {
        surveyId: survey.id,
        answers,
        locale: locales.includes(locale as Locale) ? locale : "fr",
      },
    })
    return { status: "sent" }
  } catch (error) {
    console.error("Survey response failed:", error)
    return { status: "error" }
  }
}
