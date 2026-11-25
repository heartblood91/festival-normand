import { requireRole } from "@/lib/rbac"
import { prisma } from "@/lib/prisma"
import { getPassSettingsForAdmin } from "@/lib/queries/site-settings"
import { PassPatrimoineSettingsForm } from "@/components/admin/site-settings/pass-patrimoine-settings-form"

export const metadata = {
  title: "Réglages du site - Administration",
  robots: { index: false, follow: false },
}

const AdminSiteSettingsRoute = async () => {
  await requireRole("EDITOR")
  const [settings, linkedEvents] = await Promise.all([
    getPassSettingsForAdmin(),
    prisma.event.count({ where: { published: true, passPatrimoineUrl: { not: null } } }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-foreground font-serif text-2xl font-bold">Réglages du site</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Fonctionnalités du site public que l&apos;équipe peut activer ou couper sans mise en
          ligne.
        </p>
      </div>
      <PassPatrimoineSettingsForm settings={settings} linkedEvents={linkedEvents} />
    </div>
  )
}

export default AdminSiteSettingsRoute
