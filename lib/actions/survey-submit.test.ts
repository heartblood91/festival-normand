import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, headerValues, mockVerify } = vi.hoisted(() => ({
  mockPrisma: {
    survey: { findFirst: vi.fn() },
    surveyResponse: { create: vi.fn() },
  },
  headerValues: new Map<string, string>(),
  mockVerify: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("next/headers", () => ({ headers: async () => headerValues }))
vi.mock("@/lib/turnstile", () => ({ verifyTurnstile: mockVerify }))

import { submitSurveyResponse } from "./survey-submit"

const survey = {
  id: "s1",
  questions: [
    { id: "score", type: "rating", labelFr: "Note", required: true, options: [] },
    { id: "free", type: "text", labelFr: "Remarques", required: false, options: [] },
  ],
}

const form = (data: Record<string, string>) => {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => formData.append(key, value))
  return formData
}

const submit = (data: Record<string, string>, locale = "fr") =>
  submitSurveyResponse("avis", locale, { status: "idle" }, form(data))

beforeEach(() => {
  vi.clearAllMocks()
  mockPrisma.survey.findFirst.mockResolvedValue(survey)
  headerValues.clear()
  mockVerify.mockResolvedValue(true)
})

describe("submitSurveyResponse", () => {
  it("refuses a failed anti-spam check, but only once the answers are valid", async () => {
    expect(await submit({})).toMatchObject({ status: "invalid" })
    expect(mockVerify).not.toHaveBeenCalled()

    headerValues.set("x-forwarded-for", "10.0.0.9")
    mockVerify.mockResolvedValue(false)
    expect(await submit({ q_score: "4" })).toEqual({ status: "unverified" })
    expect(mockVerify).toHaveBeenCalledWith(expect.any(FormData), "10.0.0.9")
    expect(mockPrisma.surveyResponse.create).not.toHaveBeenCalled()
  })

  it("stores the answers of a published survey with the visitor's language", async () => {
    headerValues.set("x-forwarded-for", "10.0.0.1")
    expect(await submit({ q_score: "4", q_free: "Superbe" }, "en")).toEqual({ status: "sent" })

    expect(mockPrisma.survey.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: "avis", published: true } })
    )
    expect(mockPrisma.surveyResponse.create).toHaveBeenCalledWith({
      data: { surveyId: "s1", answers: { score: 4, free: "Superbe" }, locale: "en" },
    })
  })

  it("returns the question errors without storing anything", async () => {
    expect(await submit({ q_free: "Sans note" })).toEqual({
      status: "invalid",
      errors: { score: "required" },
    })
    expect(mockPrisma.surveyResponse.create).not.toHaveBeenCalled()
  })

  it("silently drops the honeypot and refuses a closed survey", async () => {
    expect(await submit({ website: "spam", q_score: "5" })).toEqual({ status: "sent" })
    mockPrisma.survey.findFirst.mockResolvedValue(null)
    expect(await submit({ q_score: "5" })).toEqual({ status: "error" })
    expect(mockPrisma.surveyResponse.create).not.toHaveBeenCalled()
  })

  it("limits a flood from one connection", async () => {
    headerValues.set("x-forwarded-for", "10.0.0.99, 172.16.0.1")
    const results = []
    for (let i = 0; i < 21; i++) results.push((await submit({ q_score: "3" })).status)
    expect(results.filter((status) => status === "sent")).toHaveLength(20)
    expect(results.at(-1)).toBe("limited")
  })
})
