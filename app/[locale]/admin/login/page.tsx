import { Suspense } from "react"
import type { Metadata } from "next"
import { LoginForm } from "@/components/admin/login-form"

export const metadata: Metadata = {
  title: "Connexion - Administration Pierres en Lumières",
  robots: { index: false, follow: false },
}

const AdminLoginPage = () => {
  return (
    <div className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-amber-500">Pierres en Lumières</h1>
          <p className="mt-2 text-sm text-slate-400">Administration du festival</p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  )
}

export default AdminLoginPage
