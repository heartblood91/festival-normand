import { describe, it, expect } from "vitest"
import { buildSurveyCsv, summarizeResponses, type StoredResponse } from "./survey-results"
import type { SurveyQuestion } from "@/lib/schemas/survey"

const questions: SurveyQuestion[] = [
  {
    id: "visit",
    type: "single",
    labelFr: "Connu par",
    required: true,
    options: [
      { id: "press", labelFr: "Presse" },
      { id: "friends", labelFr: "Amis" },
    ],
  },
  { id: "score", type: "rating", labelFr: "Note", required: false, options: [] },
  { id: "free", type: "text", labelFr: "Remarques; idées", required: false, options: [] },
]

const at = new Date("2027-09-18T19:30:00Z")
const responses: StoredResponse[] = [
  { answers: { visit: "press", score: 5, free: 'Bravo "tous"' }, locale: "fr", createdAt: at },
  { answers: { visit: "press", score: 3 }, locale: "en", createdAt: at },
  { answers: { visit: "friends", free: "=HYPERLINK(1)" }, locale: "fr", createdAt: at },
]

describe("summarizeResponses", () => {
  it("counts choices, averages ratings and lists free answers", () => {
    const [visit, score, free] = summarizeResponses(questions, responses)
    expect(visit).toMatchObject({ kind: "choice", answered: 3, counts: { press: 2, friends: 1 } })
    expect(score).toMatchObject({ kind: "rating", answered: 2, average: 4 })
    expect(score.kind === "rating" && score.counts[5]).toBe(1)
    expect(free).toMatchObject({ kind: "text", answered: 2 })
  })

  it("has no average without ratings", () => {
    const [, score] = summarizeResponses(questions, [])
    expect(score).toMatchObject({ answered: 0, average: null })
  })
})

describe("buildSurveyCsv", () => {
  it("writes one row per response with labels, quoting and formula escaping", () => {
    const csv = buildSurveyCsv(questions, responses)
    const lines = csv.replace("﻿", "").trim().split("\r\n")
    expect(csv.startsWith("﻿")).toBe(true)
    expect(lines[0]).toBe('Date;Langue;Connu par;Note;"Remarques; idées"')
    expect(lines[1]).toBe('2027-09-18 19:30;fr;Presse;5;"Bravo ""tous"""')
    expect(lines[2]).toBe("2027-09-18 19:30;en;Presse;3;")
    expect(lines[3]).toBe("2027-09-18 19:30;fr;Amis;;'=HYPERLINK(1)")
  })
})
