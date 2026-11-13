import { prisma } from "@/lib/prisma"
import { getAuthenticatedUser } from "@/lib/rbac"
import { readQuestions, type SurveyAnswers } from "@/lib/schemas/survey"
import { buildSurveyCsv } from "@/lib/survey-results"

type ExportContext = { params: Promise<{ id: string }> }

/** CSV of every response to a survey, for editors only. */
export const GET = async (_request: Request, { params }: ExportContext) => {
  // Middleware skips /api, so this check is the only guard on the answers.
  const user = await getAuthenticatedUser()
  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const survey = await prisma.survey.findUnique({
    where: { id },
    select: {
      slug: true,
      questions: true,
      responses: {
        orderBy: { createdAt: "asc" },
        select: { answers: true, locale: true, createdAt: true },
      },
    },
  })
  if (!survey) return Response.json({ error: "Not found" }, { status: 404 })

  const csv = buildSurveyCsv(
    readQuestions(survey.questions),
    survey.responses.map((response) => ({
      ...response,
      answers: response.answers as SurveyAnswers,
    }))
  )
  const date = new Date().toISOString().slice(0, 10)
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="questionnaire-${survey.slug}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  })
}
