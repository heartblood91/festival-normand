import { z } from "zod"

export const QUESTION_TYPES = ["single", "multiple", "rating", "text"] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  single: "Choix unique",
  multiple: "Choix multiples",
  rating: "Note de 1 à 5",
  text: "Réponse libre",
}

export const RATING_VALUES = [1, 2, 3, 4, 5] as const
export const MAX_TEXT_ANSWER = 2000

const ID_PATTERN = /^[a-z0-9-]{1,40}$/

const optionalText = (max: number) =>
  z.string().trim().max(max, `${max} caractères maximum`).optional().or(z.literal(""))

const optionSchema = z.object({
  id: z.string().regex(ID_PATTERN),
  labelFr: z.string().trim().min(1, "chaque choix doit avoir un libellé").max(150),
  labelEn: optionalText(150),
})

const questionShape = z
  .object({
    id: z.string().regex(ID_PATTERN),
    type: z.enum(QUESTION_TYPES),
    labelFr: z
      .string()
      .trim()
      .min(2, "l’intitulé est obligatoire")
      .max(300, "300 caractères maximum"),
    labelEn: optionalText(300),
    required: z.boolean().default(false),
    options: z.array(optionSchema).max(20, "20 choix maximum").default([]),
  })
  .superRefine((question, ctx) => {
    const isChoice = question.type === "single" || question.type === "multiple"
    if (isChoice && question.options.length < 2) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "au moins deux choix sont nécessaires",
      })
    }
    if (new Set(question.options.map((option) => option.id)).size !== question.options.length) {
      ctx.addIssue({ code: "custom", path: ["options"], message: "choix en double" })
    }
  })

const CHOICE_TYPES: readonly unknown[] = ["single", "multiple"]

// Choices left over after switching a question to a rating or free text are dropped, not validated.
export const surveyQuestionSchema = z.preprocess(
  (value) =>
    value && typeof value === "object" && !CHOICE_TYPES.includes((value as { type?: unknown }).type)
      ? { ...value, options: [] }
      : value,
  questionShape
)

export type SurveyQuestion = z.infer<typeof surveyQuestionSchema>

export const surveyQuestionsSchema = z
  .array(surveyQuestionSchema)
  .min(1, "Ajoutez au moins une question")
  .max(40, "40 questions maximum")
  .refine(
    (questions) => new Set(questions.map((question) => question.id)).size === questions.length,
    "Questions en double"
  )

export const surveySchema = z.object({
  titleFr: z
    .string()
    .trim()
    .min(2, "Le titre doit contenir au moins 2 caractères")
    .max(150, "Le titre ne peut pas dépasser 150 caractères"),
  titleEn: optionalText(150),
  slug: z
    .string()
    .min(2, "Le slug doit contenir au moins 2 caractères")
    .max(60, "Le slug ne peut pas dépasser 60 caractères")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Le slug ne peut contenir que des lettres minuscules, chiffres et tirets"
    ),
  introFr: optionalText(2000),
  introEn: optionalText(2000),
  published: z.boolean().default(false),
  questions: surveyQuestionsSchema,
})

export type SurveyFormData = z.infer<typeof surveySchema>

/** Reads the stored questions, dropping any that no longer match the schema. */
export const readQuestions = (value: unknown): SurveyQuestion[] => {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const result = surveyQuestionSchema.safeParse(item)
    return result.success ? [result.data] : []
  })
}

export const answerFieldName = (question: Pick<SurveyQuestion, "id">) => `q_${question.id}`

export type SurveyAnswer = string | string[] | number
export type SurveyAnswers = Record<string, SurveyAnswer>
export type AnswerError = "required" | "invalid"

/**
 * Turns submitted form values into answers keyed by question id. Choices are
 * stored as option ids so translations and relabelling keep old answers.
 */
export const collectAnswers = (
  questions: SurveyQuestion[],
  getAll: (name: string) => string[]
): { answers: SurveyAnswers; errors: Record<string, AnswerError> } => {
  const answers: SurveyAnswers = {}
  const errors: Record<string, AnswerError> = {}

  for (const question of questions) {
    const values = getAll(answerFieldName(question))
      .map((value) => value.trim())
      .filter(Boolean)
    const optionIds = new Set(question.options.map((option) => option.id))

    if (!values.length) {
      if (question.required) errors[question.id] = "required"
      continue
    }

    switch (question.type) {
      case "single":
        if (values.length !== 1 || !optionIds.has(values[0])) errors[question.id] = "invalid"
        else answers[question.id] = values[0]
        break
      case "multiple":
        if (!values.every((value) => optionIds.has(value))) errors[question.id] = "invalid"
        else answers[question.id] = [...new Set(values)]
        break
      case "rating": {
        const rating = Number(values[0])
        if (values.length !== 1 || !RATING_VALUES.includes(rating as 1)) {
          errors[question.id] = "invalid"
        } else {
          answers[question.id] = rating
        }
        break
      }
      case "text":
        if (values[0].length > MAX_TEXT_ANSWER) errors[question.id] = "invalid"
        else answers[question.id] = values[0]
        break
    }
  }

  return { answers, errors }
}

/** Human-readable French value of one answer, for the export and the summary. */
export const formatAnswer = (question: SurveyQuestion, answer: SurveyAnswer | undefined) => {
  if (answer === undefined) return ""
  const label = (id: string) => question.options.find((option) => option.id === id)?.labelFr ?? id
  if (Array.isArray(answer)) return answer.map(label).join(" ; ")
  if (question.type === "single") return label(String(answer))
  return String(answer)
}
