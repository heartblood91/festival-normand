import { getDepartmentSettings } from "@/lib/queries/department-settings"
import { DepartmentEmbargoForm } from "@/components/admin/edition/department-embargo-form"

export const metadata = {
  title: "Édition - Administration",
  robots: { index: false, follow: false },
}

const AdminEditionRoute = async () => {
  const settings = await getDepartmentSettings()

  return <DepartmentEmbargoForm settings={settings} />
}

export default AdminEditionRoute
