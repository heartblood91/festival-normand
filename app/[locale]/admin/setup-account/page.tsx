import { Suspense } from "react"
import { SetupAccountForm } from "@/components/admin/setup-account-form"

export const metadata = {
  title: "Configurer mon compte - Pierres en Lumières",
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const SetupAccountRoute = async ({ searchParams }: Props) => {
  const params = await searchParams
  const token = params.token as string
  const email = params.email as string

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <Suspense fallback={<div>Chargement...</div>}>
        <SetupAccountForm token={token} email={email} />
      </Suspense>
    </div>
  )
}

export default SetupAccountRoute
