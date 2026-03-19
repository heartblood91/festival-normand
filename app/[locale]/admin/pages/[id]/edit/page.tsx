import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminPageById } from "@/lib/actions/pages"
import { PageForm } from "@/components/admin/pages/page-form"

export const metadata = {
  title: "Modifier la page - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

const EditPageRoute = async ({ params }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params
  const page = await getAdminPageById(id)

  if (!page) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
      <h1 className="mb-6 font-serif text-2xl font-bold text-amber-500">
        Modifier la page
      </h1>
      <PageForm page={page} />
    </div>
  )
}

export default EditPageRoute
