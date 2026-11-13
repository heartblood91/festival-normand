"use server"

import { revalidatePath, updateTag } from "next/cache"
import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/rbac"
import { revalidatePublic } from "@/lib/revalidate-public"
import { readQuestions, surveySchema, type SurveyAnswers } from "@/lib/schemas/survey"
import { summarizeResponses } from "@/lib/survey-results"

export type SurveyActionResult = {
  success: boolean
  message: string
  errors?: Record<string, string[]>
  surveyId?: string
}

export type SurveyInput = {
  titleFr: string
  titleEn: string
  slug: string
  introFr: string
  introEn: string
  published: boolean
  questions: unknown
}

const INVALID_FORM = "Veuillez corriger les erreurs dans le formulaire."

export const getAdminSurveys = async () => {
  await requireRole("EDITOR")
  return prisma.survey.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      titleFr: true,
      published: true,
      updatedAt: true,
      _count: { select: { responses: true } },
    },
  })
}

export type AdminSurveyListItem = Awaited<ReturnType<typeof getAdminSurveys>>[number]

export const getAdminSurveyById = async (id: string) => {
  await requireRole("EDITOR")
  const survey = await prisma.survey.findUnique({
    where: { id },
    include: { _count: { select: { responses: true } } },
  })
  return survey ? { ...survey, questions: readQuestions(survey.questions) } : null
}

export type AdminSurvey = NonNullable<Awaited<ReturnType<typeof getAdminSurveyById>>>

export const getSurveyResults = async (id: string) => {
  await requireRole("EDITOR")
  const survey = await prisma.survey.findUnique({
    where: { id },
    select: {
      id: true,
      slug: true,
      titleFr: true,
      published: true,
      questions: true,
      responses: {
        orderBy: { createdAt: "desc" },
        select: { answers: true, locale: true, createdAt: true },
      },
    },
  })
  if (!survey) return null
  const questions = readQuestions(survey.questions)
  const responses = survey.responses.map((response) => ({
    ...response,
    answers: response.answers as SurveyAnswers,
  }))
  return {
    id: survey.id,
    slug: survey.slug,
    titleFr: survey.titleFr,
    published: survey.published,
    total: responses.length,
    summaries: summarizeResponses(questions, responses),
  }
}

export type SurveyResults = NonNullable<Awaited<ReturnType<typeof getSurveyResults>>>

const revalidateSurvey = (...slugs: string[]) => {
  updateTag("surveys")
  revalidatePublic(
    ...slugs.flatMap((slug) => [`/questionnaire/${slug}`, `/questionnaire/${slug}/imprimer`])
  )
  revalidatePath("/[locale]/admin/surveys", "layout")
}

const flattenErrors = (issues: { path: PropertyKey[]; message: string }[]) => {
  const errors: Record<string, string[]> = {}
  for (const issue of issues) {
    const key = String(issue.path[0] ?? "form")
    const index = issue.path[1]
    const message =
      key === "questions" && typeof index === "number"
        ? `Question ${index + 1} : ${issue.message}`
        : issue.message
    errors[key] = [...(errors[key] ?? []), message]
  }
  return errors
}

export const saveSurvey = async (
  id: string | null,
  input: SurveyInput
): Promise<SurveyActionResult> => {
  try {
    await requireRole("EDITOR")
    const result = surveySchema.safeParse(input)
    if (!result.success) {
      return { success: false, message: INVALID_FORM, errors: flattenErrors(result.error.issues) }
    }
    const data = result.data

    const taken = await prisma.survey.findFirst({
      where: { slug: data.slug, ...(id ? { id: { not: id } } : {}) },
      select: { id: true },
    })
    if (taken) {
      return {
        success: false,
        message: "Ce slug est déjà utilisé par un autre questionnaire.",
        errors: { slug: ["Ce slug est déjà utilisé"] },
      }
    }

    const previous = id
      ? await prisma.survey.findUnique({ where: { id }, select: { slug: true } })
      : null
    if (id && !previous) return { success: false, message: "Questionnaire introuvable." }

    const values = {
      titleFr: data.titleFr,
      titleEn: data.titleEn || null,
      slug: data.slug,
      introFr: data.introFr || null,
      introEn: data.introEn || null,
      published: data.published,
      questions: data.questions.map((question) => ({
        ...question,
        labelEn: question.labelEn || undefined,
        options: question.options.map((option) => ({
          ...option,
          labelEn: option.labelEn || undefined,
        })),
      })) as Prisma.InputJsonValue,
    }

    const survey = id
      ? await prisma.survey.update({ where: { id }, data: values })
      : await prisma.survey.create({ data: values })
    revalidateSurvey(data.slug, ...(previous && previous.slug !== data.slug ? [previous.slug] : []))
    return {
      success: true,
      message: id ? "Questionnaire mis à jour." : "Questionnaire créé.",
      surveyId: survey.id,
    }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de l'enregistrement." }
  }
}

/** Removes the survey and every response to it. */
export const deleteSurvey = async (id: string): Promise<SurveyActionResult> => {
  try {
    await requireRole("EDITOR")
    const survey = await prisma.survey.delete({ where: { id }, select: { slug: true } })
    revalidateSurvey(survey.slug)
    return { success: true, message: "Questionnaire et réponses supprimés." }
  } catch {
    return { success: false, message: "Une erreur est survenue lors de la suppression." }
  }
}
