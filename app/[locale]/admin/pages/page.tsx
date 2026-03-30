import { getAdminPages } from "@/lib/actions/pages"
import { AdminPagesPage } from "@/components/admin/pages/admin-pages-page"

export const metadata = {
  title: "Pages - Administration",
  robots: { index: false, follow: false },
}

const AdminPagesRoute = async () => {
  const pages = await getAdminPages()

  return <AdminPagesPage pages={pages} />
}

export default AdminPagesRoute
