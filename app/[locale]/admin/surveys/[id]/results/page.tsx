import { notFound } from "next/navigation"
import { getSurveyResults } from "@/lib/actions/surveys"
import { SurveyResults } from "@/components/admin/surveys/survey-results"

export const metadata = {
  title: "Résultats du questionnaire - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

const SurveyResultsRoute = async ({ params }: Props) => {
  const { id } = await params
  const results = await getSurveyResults(id)

  if (!results) {
    notFound()
  }

  return <SurveyResults results={results} />
}

export default SurveyResultsRoute
