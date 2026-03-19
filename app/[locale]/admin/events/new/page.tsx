import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { EventForm } from "@/components/admin/events/event-form"

export const metadata = {
  title: "Nouvel événement - Administration",
  robots: { index: false, follow: false },
}

const NewEventRoute = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect("/admin/login")
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 md:p-8">
      <h1 className="mb-6 font-serif text-2xl font-bold text-amber-500">
        Nouvel événement
      </h1>
      <EventForm />
    </div>
  )
}

export default NewEventRoute
