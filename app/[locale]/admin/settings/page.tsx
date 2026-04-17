import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { ChangePasswordForm } from "@/components/admin/settings/change-password-form"

const SettingsPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/fr/admin/login")

  return (
    <div className="space-y-8 p-6 md:p-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Paramètres du compte
        </h1>
        <p className="text-muted-foreground mt-2">
          {session.user.name} — {session.user.email}
        </p>
      </div>

      <section className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:p-8">
        <h2 className="mb-1 font-serif text-xl font-bold text-foreground">Mot de passe</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          Changer votre mot de passe déconnectera toutes vos autres sessions actives.
        </p>
        <ChangePasswordForm />
      </section>
    </div>
  )
}

export default SettingsPage
