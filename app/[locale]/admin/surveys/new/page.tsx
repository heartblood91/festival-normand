import { requireRole } from "@/lib/rbac"
import { SurveyForm } from "@/components/admin/surveys/survey-form"

export const metadata = {
  title: "Nouveau questionnaire - Administration",
  robots: { index: false, follow: false },
}

const NewSurveyRoute = async () => {
  await requireRole("EDITOR")

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="mb-6 font-serif text-2xl font-bold text-amber-500">Nouveau questionnaire</h1>
      <SurveyForm />
    </div>
  )
}

export default NewSurveyRoute
