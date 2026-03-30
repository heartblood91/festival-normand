import { getAdminEvents } from "@/lib/actions/events"
import { AdminEventsPage } from "@/components/admin/events/admin-events-page"

export const metadata = {
  title: "Événements - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{
    search?: string
    page?: string
    status?: string
    department?: string
    category?: string
    featured?: string
  }>
}

const AdminEventsRoute = async ({ searchParams }: Props) => {
  const params = await searchParams
  const page = params.page ? parseInt(params.page, 10) : 1
  const limit = 25

  const data = await getAdminEvents({
    search: params.search,
    page,
    limit,
    status: (params.status as "published" | "draft" | "depublished" | "all") || "all",
    department: params.department,
    category: params.category,
    featured: params.featured,
  })

  return (
    <AdminEventsPage
      items={data.items}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      search={params.search}
      status={params.status}
      department={params.department}
      category={params.category}
      featured={params.featured}
    />
  )
}

export default AdminEventsRoute
