import { getTranslations } from "next-intl/server"
import { getDepartmentSettings } from "@/lib/queries/department-settings"
import { getEditionSettings } from "@/lib/queries/edition"
import { DEFAULT_EDITION_SETTINGS, buildEdition } from "@/lib/festival/edition"
import { EditionDatesForm } from "@/components/admin/edition/edition-dates-form"
import { DepartmentEmbargoForm } from "@/components/admin/edition/department-embargo-form"

export const metadata = {
  title: "Édition - Administration",
  robots: { index: false, follow: false },
}

const AdminEditionRoute = async () => {
  const [t, settings, edition] = await Promise.all([
    getTranslations("admin.edition"),
    getDepartmentSettings(),
    getEditionSettings(),
  ])

  return (
    <div className="space-y-6">
      <h1 className="text-foreground font-serif text-2xl font-bold">{t("title")}</h1>
      <EditionDatesForm
        settings={edition}
        defaultBilanFrom={buildEdition({ ...edition, bilanFrom: null }).bilanFrom}
        isDefault={edition === DEFAULT_EDITION_SETTINGS}
      />
      <DepartmentEmbargoForm settings={settings} />
    </div>
  )
}

export default AdminEditionRoute
