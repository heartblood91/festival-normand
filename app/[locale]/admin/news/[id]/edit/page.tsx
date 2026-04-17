import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminNewsById } from "@/lib/actions/news"
import { NewsForm } from "@/components/admin/news/news-form"

export const metadata = {
  title: "Modifier l'article - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

const EditNewsRoute = async ({ params }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params
  const article = await getAdminNewsById(id)

  if (!article) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
      <h1 className="mb-6 font-serif text-2xl font-bold text-amber-500">Modifier l&apos;article</h1>
      <NewsForm article={article} />
    </div>
  )
}

export default EditNewsRoute
