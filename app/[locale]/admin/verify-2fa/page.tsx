import { TwoFactorVerifyForm } from "@/components/admin/two-factor-verify-form"

const Verify2faPage = () => (
  <div className="flex min-h-dvh items-center justify-center bg-slate-950 px-4">
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-amber-400">Pierres en Lumières</h1>
        <p className="mt-1 text-sm text-slate-400">Vérification en deux étapes</p>
      </div>
      <TwoFactorVerifyForm />
    </div>
  </div>
)

export default Verify2faPage
