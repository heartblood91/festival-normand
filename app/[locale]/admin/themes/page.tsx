import { getAdminThemes } from "@/lib/actions/themes"
import { AdminThemesPage } from "@/components/admin/themes/admin-themes-page"

export const metadata = {
  title: "Thématiques - Administration",
  robots: { index: false, follow: false },
}

const AdminThemesRoute = async () => {
  const themes = await getAdminThemes()

  return <AdminThemesPage themes={themes} />
}

export default AdminThemesRoute
