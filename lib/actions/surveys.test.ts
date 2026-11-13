import { describe, it, expect, vi, beforeEach } from "vitest"

const { mockPrisma, mockRequireRole } = vi.hoisted(() => ({
  mockPrisma: {
    survey: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  mockRequireRole: vi.fn(),
}))

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }))
vi.mock("@/lib/rbac", () => ({ requireRole: mockRequireRole }))
vi.mock("next/cache", () => ({ revalidatePath: vi.fn(), updateTag: vi.fn() }))

import { deleteSurvey, getAdminSurveys, getSurveyResults, saveSurvey } from "./surveys"

const valid = {
  titleFr: "Votre avis",
  titleEn: "",
  slug: "votre-avis",
  introFr: "",
  introEn: "",
  published: true,
  questions: [
    {
      id: "score",
      type: "rating",
      labelFr: "Votre note",
      labelEn: "",
      required: true,
      // Left empty after switching the question from a choice to a rating.
      options: [{ id: "stale", labelFr: "", labelEn: "" }],
    },
  ],
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRequireRole.mockResolvedValue({ id: "u1", role: "EDITOR" })
  mockPrisma.survey.findFirst.mockResolvedValue(null)
  mockPrisma.survey.create.mockResolvedValue({ id: "s1" })
})

describe("survey actions", () => {
  it("require an editor before touching the database", async () => {
    mockRequireRole.mockRejectedValue(new Error("Forbidden"))

    await expect(getAdminSurveys()).rejects.toThrow("Forbidden")
    await expect(getSurveyResults("s1")).rejects.toThrow("Forbidden")
    expect((await saveSurvey(null, valid)).success).toBe(false)
    expect((await deleteSurvey("s1")).success).toBe(false)

    expect(mockRequireRole).toHaveBeenCalledWith("EDITOR")
    expect(mockPrisma.survey.create).not.toHaveBeenCalled()
    expect(mockPrisma.survey.delete).not.toHaveBeenCalled()
  })

  it("stores a valid survey and drops options left on non-choice questions", async () => {
    const result = await saveSurvey(null, valid)

    expect(result).toMatchObject({ success: true, surveyId: "s1" })
    const data = mockPrisma.survey.create.mock.calls[0][0].data
    expect(data).toMatchObject({ titleFr: "Votre avis", titleEn: null, published: true })
    expect(data.questions).toEqual([
      { id: "score", type: "rating", labelFr: "Votre note", required: true, options: [] },
    ])
  })

  it("numbers question errors and refuses a taken slug", async () => {
    const empty = { ...valid, questions: [{ ...valid.questions[0], labelFr: "" }] }
    const invalid = await saveSurvey(null, empty)
    expect(invalid.errors?.questions?.[0]).toMatch(/^Question 1 : /)

    mockPrisma.survey.findFirst.mockResolvedValue({ id: "other" })
    const taken = await saveSurvey(null, valid)
    expect(taken.errors?.slug).toEqual(["Ce slug est déjà utilisé"])
    expect(mockPrisma.survey.create).not.toHaveBeenCalled()
  })
})
