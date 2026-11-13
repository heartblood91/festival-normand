import {
  RATING_VALUES,
  formatAnswer,
  type SurveyAnswers,
  type SurveyQuestion,
} from "@/lib/schemas/survey"

export type StoredResponse = { answers: SurveyAnswers; locale: string; createdAt: Date }

export type QuestionSummary =
  | { question: SurveyQuestion; answered: number; kind: "choice"; counts: Record<string, number> }
  | {
      question: SurveyQuestion
      answered: number
      kind: "rating"
      counts: Record<number, number>
      average: number | null
    }
  | { question: SurveyQuestion; answered: number; kind: "text"; texts: string[] }

// The admin summary lists the latest free answers; the export has all of them.
const MAX_TEXTS = 50

/** Per-question totals of the answers, newest responses first. */
export const summarizeResponses = (
  questions: SurveyQuestion[],
  responses: StoredResponse[]
): QuestionSummary[] =>
  questions.map((question) => {
    const answers = responses
      .map((response) => response.answers[question.id])
      .filter((answer) => answer !== undefined)

    if (question.type === "rating") {
      const counts = Object.fromEntries(RATING_VALUES.map((value) => [value, 0]))
      const ratings = answers.filter((answer): answer is number => typeof answer === "number")
      ratings.forEach((rating) => (counts[rating] = (counts[rating] ?? 0) + 1))
      const average = ratings.length
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : null
      return { question, answered: ratings.length, kind: "rating", counts, average }
    }

    if (question.type === "text") {
      const texts = answers.filter((answer): answer is string => typeof answer === "string")
      return { question, answered: texts.length, kind: "text", texts: texts.slice(0, MAX_TEXTS) }
    }

    const counts = Object.fromEntries(question.options.map((option) => [option.id, 0]))
    answers.flat().forEach((id) => {
      if (typeof id === "string" && id in counts) counts[id]++
    })
    return { question, answered: answers.length, kind: "choice", counts }
  })

const csvCell = (value: string) => {
  // A leading =, +, - or @ would run as a formula in a spreadsheet.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
  return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe
}

/**
 * One row per response, one column per question, semicolon-separated with a
 * BOM so Excel in French opens accents and columns correctly.
 */
export const buildSurveyCsv = (questions: SurveyQuestion[], responses: StoredResponse[]) => {
  const header = ["Date", "Langue", ...questions.map((question) => question.labelFr)]
  const rows = responses.map((response) => [
    response.createdAt.toISOString().replace("T", " ").slice(0, 16),
    response.locale,
    ...questions.map((question) => formatAnswer(question, response.answers[question.id])),
  ])
  return `﻿${[header, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n")}\r\n`
}
