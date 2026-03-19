import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminPages } from "@/lib/actions/pages"
import { AdminPagesPage } from "@/components/admin/pages/admin-pages-page"

export const metadata = {
  title: "Pages - Administration",
  robots: { index: false, follow: false },
}

const AdminPagesRoute = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  const pages = await getAdminPages()

  return <AdminPagesPage pages={pages} />
}

export default AdminPagesRoute
