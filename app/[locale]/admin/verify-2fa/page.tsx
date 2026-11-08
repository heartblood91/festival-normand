import { TwoFactorVerifyForm } from "@/components/admin/two-factor-verify-form"

const Verify2faPage = () => (
  <div className="bg-background flex min-h-dvh items-center justify-center px-4">
    <div className="w-full max-w-md space-y-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-amber-400">Pierres en Lumières</h1>
        <p className="text-muted-foreground mt-1 text-sm">Vérification en deux étapes</p>
      </div>
      <TwoFactorVerifyForm />
    </div>
  </div>
)

export default Verify2faPage
