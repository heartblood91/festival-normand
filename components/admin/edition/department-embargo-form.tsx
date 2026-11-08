"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFormatter, useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateDepartmentEmbargo } from "@/lib/actions/department-settings"
import type { DepartmentSettingItem } from "@/lib/queries/department-settings"

// `publishFrom` is stored as local midnight; format it back as a local yyyy-mm-dd.
const toDateInput = (iso: string | null) => {
  if (!iso) return ""
  const date = new Date(iso)
  const pad = (value: number) => String(value).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export const DepartmentEmbargoForm = ({ settings }: { settings: DepartmentSettingItem[] }) => {
  const router = useRouter()
  const t = useTranslations("admin.edition")
  const tDepartments = useTranslations("departments")
  const format = useFormatter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await updateDepartmentEmbargo(new FormData(e.currentTarget))
    setIsSubmitting(false)
    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-foreground">{t("embargo.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{t("embargo.description")}</p>
          <div className="grid gap-4 sm:grid-cols-2">
            {settings.map(({ department, publishFrom }) => {
              const hidden = publishFrom !== null && new Date(publishFrom) > new Date()
              const statusId = `${department}-status`
              return (
                <div key={department}>
                  <Label htmlFor={department} className="text-foreground">
                    {tDepartments(department)}
                  </Label>
                  <Input
                    id={department}
                    name={department}
                    type="date"
                    defaultValue={toDateInput(publishFrom)}
                    aria-describedby={statusId}
                    className="mt-1 min-h-11 border-white/10 bg-white/5"
                  />
                  <p
                    id={statusId}
                    className={`mt-1 text-xs ${hidden ? "text-amber-300" : "text-muted-foreground"}`}
                  >
                    {hidden
                      ? t("embargo.hiddenUntil", {
                          date: format.dateTime(new Date(publishFrom), { dateStyle: "long" }),
                        })
                      : t("embargo.visible")}
                  </p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="min-h-11">
          {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
          {t("embargo.save")}
        </Button>
      </div>
    </form>
  )
}
