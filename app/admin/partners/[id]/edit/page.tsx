import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminPartnerById } from "@/lib/actions/partners"
import { PartnerForm } from "@/components/admin/partners/partner-form"

export const metadata = {
  title: "Modifier le partenaire - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

const EditPartnerRoute = async ({ params }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params
  const partner = await getAdminPartnerById(id)

  if (!partner) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
      <h1 className="mb-6 font-serif text-2xl font-bold text-amber-500">
        Modifier le partenaire
      </h1>
      <PartnerForm partner={partner} />
    </div>
  )
}

export default EditPartnerRoute
