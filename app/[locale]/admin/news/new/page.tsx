import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { NewsForm } from "@/components/admin/news/news-form"

export const metadata = {
  title: "Nouvel article - Administration",
  robots: { index: false, follow: false },
}

const NewNewsRoute = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
      <h1 className="mb-6 font-serif text-2xl font-bold text-amber-500">
        Nouvel article
      </h1>
      <NewsForm />
    </div>
  )
}

export default NewNewsRoute
