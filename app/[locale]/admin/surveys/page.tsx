import { getAdminSurveys } from "@/lib/actions/surveys"
import { AdminSurveysPage } from "@/components/admin/surveys/admin-surveys-page"

export const metadata = {
  title: "Questionnaires - Administration",
  robots: { index: false, follow: false },
}

const AdminSurveysRoute = async () => {
  const surveys = await getAdminSurveys()

  return <AdminSurveysPage surveys={surveys} />
}

export default AdminSurveysRoute
