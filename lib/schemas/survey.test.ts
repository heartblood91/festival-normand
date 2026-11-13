import { describe, it, expect } from "vitest"
import {
  collectAnswers,
  formatAnswer,
  readQuestions,
  surveySchema,
  type SurveyQuestion,
} from "./survey"

const choice: SurveyQuestion = {
  id: "visit",
  type: "single",
  labelFr: "Comment avez-vous connu le festival ?",
  required: true,
  options: [
    { id: "press", labelFr: "Presse" },
    { id: "friends", labelFr: "Bouche-à-oreille" },
  ],
}
const multi: SurveyQuestion = {
  ...choice,
  id: "liked",
  type: "multiple",
  required: false,
  options: [...choice.options, { id: "web", labelFr: "Site web" }],
}
const rating: SurveyQuestion = {
  id: "score",
  type: "rating",
  labelFr: "Note",
  required: true,
  options: [],
}
const text: SurveyQuestion = {
  id: "free",
  type: "text",
  labelFr: "Remarques",
  required: false,
  options: [],
}
const questions = [choice, multi, rating, text]

const answersFrom = (values: Record<string, string[]>) =>
  collectAnswers(questions, (name) => values[name] ?? [])

describe("surveySchema", () => {
  const base = { titleFr: "Votre avis", slug: "avis-2027", published: true }

  it("accepts every question type", () => {
    expect(surveySchema.safeParse({ ...base, questions }).success).toBe(true)
  })

  it("asks for two choices on choice questions and at least one question", () => {
    const oneChoice = { ...choice, options: [choice.options[0]] }
    const result = surveySchema.safeParse({ ...base, questions: [oneChoice] })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(["questions", 0, "options"])
    expect(surveySchema.safeParse({ ...base, questions: [] }).success).toBe(false)
  })

  it("refuses duplicate question ids", () => {
    expect(surveySchema.safeParse({ ...base, questions: [text, text] }).success).toBe(false)
  })
})

describe("readQuestions", () => {
  it("drops stored questions that no longer match the schema", () => {
    expect(readQuestions([choice, { id: "x", type: "unknown" }]).map((q) => q.id)).toEqual([
      "visit",
    ])
    expect(readQuestions(null)).toEqual([])
  })
})

describe("collectAnswers", () => {
  it("keeps option ids, a numeric rating and trimmed text", () => {
    const { answers, errors } = answersFrom({
      q_visit: ["press"],
      q_liked: ["web", "press", "web"],
      q_score: ["4"],
      q_free: ["  Très beau  "],
    })
    expect(errors).toEqual({})
    expect(answers).toEqual({
      visit: "press",
      liked: ["web", "press"],
      score: 4,
      free: "Très beau",
    })
  })

  it("flags missing required answers and leaves optional ones out", () => {
    const { answers, errors } = answersFrom({ q_score: ["5"] })
    expect(errors).toEqual({ visit: "required" })
    expect(answers).toEqual({ score: 5 })
  })

  it("refuses unknown options and out-of-range ratings", () => {
    const { errors } = answersFrom({ q_visit: ["hacked"], q_liked: ["nope"], q_score: ["9"] })
    expect(errors).toEqual({ visit: "invalid", liked: "invalid", score: "invalid" })
  })
})

describe("formatAnswer", () => {
  it("shows French labels for choices", () => {
    expect(formatAnswer(choice, "friends")).toBe("Bouche-à-oreille")
    expect(formatAnswer(multi, ["press", "web"])).toBe("Presse ; Site web")
    expect(formatAnswer(rating, 3)).toBe("3")
    expect(formatAnswer(text, undefined)).toBe("")
  })
})
