import { getAdminEvents } from "@/lib/actions/events"
import { parseEventListParams } from "@/lib/admin/event-list"
import { AdminEventsPage } from "@/components/admin/events/admin-events-page"

export const metadata = {
  title: "Événements - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<Record<string, string | undefined>>
}

const AdminEventsRoute = async ({ searchParams }: Props) => {
  const params = parseEventListParams(await searchParams)
  const data = await getAdminEvents({ ...params, limit: 25 })

  return (
    <AdminEventsPage
      items={data.items}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      params={params}
    />
  )
}

export default AdminEventsRoute
