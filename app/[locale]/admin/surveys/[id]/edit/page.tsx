import { notFound } from "next/navigation"
import { getAdminSurveyById } from "@/lib/actions/surveys"
import { SurveyForm } from "@/components/admin/surveys/survey-form"

export const metadata = {
  title: "Modifier le questionnaire - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

const EditSurveyRoute = async ({ params }: Props) => {
  const { id } = await params
  const survey = await getAdminSurveyById(id)

  if (!survey) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="mb-6 font-serif text-2xl font-bold text-amber-500">
        Modifier le questionnaire
      </h1>
      <SurveyForm survey={survey} />
    </div>
  )
}

export default EditSurveyRoute
