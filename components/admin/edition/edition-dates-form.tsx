"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateEdition } from "@/lib/actions/edition"
import type { EditionSettings } from "@/lib/festival/edition"

type EditionDatesFormProps = {
  settings: EditionSettings
  /** Resolved bilan switch, shown when the field is left empty */
  defaultBilanFrom: string
  /** True while no edition was saved and the code default applies */
  isDefault: boolean
}

export const EditionDatesForm = ({
  settings,
  defaultBilanFrom,
  isDefault,
}: EditionDatesFormProps) => {
  const router = useRouter()
  const t = useTranslations("admin.edition.dates")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    const result = await updateEdition(new FormData(e.currentTarget))
    setIsSubmitting(false)
    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-foreground">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{t("description")}</p>
          {isDefault ? (
            <p role="status" className="text-sm text-amber-300">
              {t("provisional")}
            </p>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Label htmlFor="edition-year" className="text-foreground">
                {t("year")}
              </Label>
              <Input
                id="edition-year"
                name="year"
                type="number"
                inputMode="numeric"
                min={2009}
                max={2100}
                required
                defaultValue={settings.year}
                className="mt-1 min-h-11 border-white/10 bg-white/5"
              />
            </div>
            <div>
              <Label htmlFor="edition-start" className="text-foreground">
                {t("dateStart")}
              </Label>
              <Input
                id="edition-start"
                name="dateStart"
                type="date"
                required
                defaultValue={settings.dateStart}
                className="mt-1 min-h-11 border-white/10 bg-white/5"
              />
            </div>
            <div>
              <Label htmlFor="edition-end" className="text-foreground">
                {t("dateEnd")}
              </Label>
              <Input
                id="edition-end"
                name="dateEnd"
                type="date"
                required
                defaultValue={settings.dateEnd}
                className="mt-1 min-h-11 border-white/10 bg-white/5"
              />
            </div>
            <div>
              <Label htmlFor="edition-bilan" className="text-foreground">
                {t("bilanFrom")}
              </Label>
              <Input
                id="edition-bilan"
                name="bilanFrom"
                type="date"
                defaultValue={settings.bilanFrom ?? ""}
                aria-describedby="edition-bilan-hint"
                className="mt-1 min-h-11 border-white/10 bg-white/5"
              />
              <p id="edition-bilan-hint" className="text-muted-foreground mt-1 text-xs">
                {t("bilanHint", { date: defaultBilanFrom })}
              </p>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="min-h-11">
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
              {t("save")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
