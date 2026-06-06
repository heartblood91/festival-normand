import { getRegistrationLinks } from "@/lib/queries/registration-links"
import { RegistrationLinksForm } from "@/components/admin/inscription/registration-links-form"

export const metadata = {
  title: "Liens d'inscription - Administration",
  robots: { index: false, follow: false },
}

const AdminRegistrationLinksRoute = async () => {
  const links = await getRegistrationLinks()

  return <RegistrationLinksForm links={links} />
}

export default AdminRegistrationLinksRoute
