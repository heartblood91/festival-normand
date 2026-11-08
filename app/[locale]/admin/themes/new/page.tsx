import { requireRole } from "@/lib/rbac"
import { ThemeForm } from "@/components/admin/themes/theme-form"

export const metadata = {
  title: "Nouvelle thématique - Administration",
  robots: { index: false, follow: false },
}

const NewThemeRoute = async () => {
  await requireRole("EDITOR")

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="mb-6 font-serif text-2xl font-bold text-amber-500">Nouvelle thématique</h1>
      <ThemeForm />
    </div>
  )
}

export default NewThemeRoute
