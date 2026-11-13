import { getAdminEvents } from "@/lib/actions/events"
import { parseEventListParams } from "@/lib/admin/event-list"
import { AdminEventsPage } from "@/components/admin/events/admin-events-page"
import { countMissingSocialLinks } from "@/lib/actions/community"

export const metadata = {
  title: "Événements - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<Record<string, string | undefined>>
}

const AdminEventsRoute = async ({ searchParams }: Props) => {
  const params = parseEventListParams(await searchParams)
  const [data, missingSocial] = await Promise.all([
    getAdminEvents({ ...params, limit: 25 }),
    countMissingSocialLinks(),
  ])

  return (
    <AdminEventsPage
      items={data.items}
      total={data.total}
      page={data.page}
      totalPages={data.totalPages}
      params={params}
      missingSocial={missingSocial}
    />
  )
}

export default AdminEventsRoute
