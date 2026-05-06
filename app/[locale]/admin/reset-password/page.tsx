import { Suspense } from "react"
import type { Metadata } from "next"
import { ResetPasswordForm } from "@/components/admin/reset-password-form"

export const metadata: Metadata = {
  title: "Réinitialisation du mot de passe — Pierres en Lumières",
  robots: { index: false, follow: false },
}

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const ResetPasswordPage = async ({ searchParams }: Props) => {
  const params = await searchParams
  const token = typeof params.token === "string" ? params.token : undefined

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-amber-500">Pierres en Lumières</h1>
          <p className="mt-2 text-sm text-slate-400">Définir un nouveau mot de passe</p>
        </div>
        <Suspense>
          <ResetPasswordForm token={token} />
        </Suspense>
      </div>
    </div>
  )
}

export default ResetPasswordPage
