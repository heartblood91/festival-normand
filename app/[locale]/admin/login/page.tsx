import { Suspense } from "react"
import type { Metadata } from "next"
import { LoginForm } from "@/components/admin/login-form"
import { isEmailEnabled } from "@/lib/email"

export const metadata: Metadata = {
  title: "Connexion - Administration Pierres en Lumières",
  robots: { index: false, follow: false },
}

const AdminLoginPage = () => {
  const emailEnabled = isEmailEnabled()

  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-amber-500">Pierres en Lumières</h1>
          <p className="text-muted-foreground mt-2 text-sm">Administration du festival</p>
        </div>
        <Suspense>
          <LoginForm emailEnabled={emailEnabled} />
        </Suspense>
      </div>
    </div>
  )
}

export default AdminLoginPage
