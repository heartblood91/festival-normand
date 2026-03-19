import { headers } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { auth } from "@/lib/auth"
import { getAdminEventById } from "@/lib/actions/events"
import { EventForm } from "@/components/admin/events/event-form"

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
  const event = await getAdminEventById(id)

  if (!event) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
      <h1 className="mb-6 font-serif text-2xl font-bold text-amber-500">
        Modifier l&apos;événement
      </h1>
      <EventForm event={event} />
    </div>
  )
}

export default EditEventRoute
