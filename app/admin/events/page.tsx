import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminEvents } from "@/lib/actions/events"
import { AdminEventsPage } from "@/components/admin/events/admin-events-page"

export const metadata = {
  title: "Événements - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<{ search?: string }>
}

const AdminEventsRoute = async ({ searchParams }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  const params = await searchParams
  const events = await getAdminEvents(params.search)

  return <AdminEventsPage events={events} search={params.search} />
}

export default AdminEventsRoute
