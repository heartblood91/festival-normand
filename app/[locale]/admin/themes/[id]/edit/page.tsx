import { notFound } from "next/navigation"
import { getAdminThemeById } from "@/lib/actions/themes"
import { ThemeForm } from "@/components/admin/themes/theme-form"

export const metadata = {
  title: "Modifier la thématique - Administration",
  robots: { index: false, follow: false },
}

type Props = {
  params: Promise<{ id: string }>
}

const EditThemeRoute = async ({ params }: Props) => {
  const { id } = await params
  const theme = await getAdminThemeById(id)

  if (!theme) {
    notFound()
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <h1 className="mb-6 font-serif text-2xl font-bold text-amber-500">Modifier la thématique</h1>
      <ThemeForm theme={theme} />
    </div>
  )
}

export default EditThemeRoute
