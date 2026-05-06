import type { Metadata } from "next"
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form"
import { isEmailEnabled } from "@/lib/email"

export const metadata: Metadata = {
  title: "Mot de passe oublié — Pierres en Lumières",
  robots: { index: false, follow: false },
}

const ForgotPasswordPage = () => {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-amber-500">Pierres en Lumières</h1>
          <p className="mt-2 text-sm text-slate-400">Réinitialisation du mot de passe</p>
        </div>
        <ForgotPasswordForm emailEnabled={isEmailEnabled()} />
      </div>
    </div>
  )
}

export default ForgotPasswordPage
