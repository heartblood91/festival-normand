import { getAdminPartners } from "@/lib/actions/partners"
import { AdminPartnersPage } from "@/components/admin/partners/admin-partners-page"

export const metadata = {
  title: "Partenaires - Administration",
  robots: { index: false, follow: false },
}

const AdminPartnersRoute = async () => {
  const partners = await getAdminPartners()

  return <AdminPartnersPage partners={partners} />
}

export default AdminPartnersRoute
