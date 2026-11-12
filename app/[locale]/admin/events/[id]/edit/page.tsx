import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminEventById } from "@/lib/actions/events"
import { getThemeOptions } from "@/lib/actions/themes"
import { getFundraisingSuggestions } from "@/lib/actions/fundraising"
import { EventForm } from "@/components/admin/events/event-form"
import { EventCommunityCard } from "@/components/admin/events/event-community-card"
import { getEventCommunity } from "@/lib/actions/community"

export const metadata = {
  title: "Modifier l'événement - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

const EditEventRoute = async ({ params }: Props) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  const { id } = await params
  const [event, themes, fundraisingSuggestions, community] = await Promise.all([
    getAdminEventById(id),
    getThemeOptions(),
    getFundraisingSuggestions(id),
    getEventCommunity(id),
  ])

  if (!event || !community) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="mb-6 font-serif text-2xl font-bold text-amber-500">
        Modifier l&apos;événement
      </h1>
      <EventForm event={event} themes={themes} fundraisingSuggestions={fundraisingSuggestions} />
      <EventCommunityCard eventId={event.id} community={community} />
    </div>
  )
}

export default EditEventRoute
