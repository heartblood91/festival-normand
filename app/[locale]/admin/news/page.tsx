import { getAdminNews } from "@/lib/actions/news"
import { AdminNewsPage } from "@/components/admin/news/admin-news-page"

export const metadata = {
  title: "Actualités - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{
    search?: string
    page?: string
    status?: string
  }>
}

const AdminNewsRoute = async ({ searchParams }: Props) => {
  const params = await searchParams
  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = 25

  const data = await getAdminNews({
    search: params.search,
    page,
    limit,
    status: (params.status as "published" | "draft" | "all") || "all",
  })

  return (
    <AdminNewsPage
      items={data.items}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      search={params.search}
      status={params.status}
    />
  )
}

export default AdminNewsRoute
