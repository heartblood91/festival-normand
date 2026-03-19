import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminNews } from "@/lib/actions/news"
import { AdminNewsPage } from "@/components/admin/news/admin-news-page"

export const metadata = {
  title: "Actualités - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ search?: string }>
}

const AdminNewsRoute = async ({ searchParams }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  const params = await searchParams
  const news = await getAdminNews(params.search)

  return <AdminNewsPage news={news} search={params.search} />
}

export default AdminNewsRoute
