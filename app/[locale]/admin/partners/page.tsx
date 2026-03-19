import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminPartners } from "@/lib/actions/partners"
import { AdminPartnersPage } from "@/components/admin/partners/admin-partners-page"

export const metadata = {
  title: "Partenaires - Administration",
  robots: { index: false, follow: false },
}

const AdminPartnersRoute = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  const partners = await getAdminPartners()

  return <AdminPartnersPage partners={partners} />
}

export default AdminPartnersRoute
