"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Ticket } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updatePassPatrimoineSettings } from "@/lib/actions/site-settings"
import type { BannerPage, PassPatrimoineSettings } from "@/lib/site-settings/pass-patrimoine"

type PassPatrimoineSettingsFormProps = {
  settings: PassPatrimoineSettings
  /** Published events with a Pass Patrimoine link. */
  linkedEvents: number
}

const PAGE_OPTIONS: { value: BannerPage; label: string }[] = [
  { value: "home", label: "Accueil" },
  { value: "programme", label: "Programme" },
  { value: "event", label: "Fiches événement" },
]

const FieldError = ({ id, errors }: { id: string; errors?: string[] }) =>
  errors?.length ? (
    <p id={id} className="mt-1 text-sm text-red-400">
      {errors[0]}
    </p>
  ) : null

const toggleClass =
  "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-white/10 p-3 transition-colors hover:bg-white/5"

export const PassPatrimoineSettingsForm = ({
  settings,
  linkedEvents,
}: PassPatrimoineSettingsFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    // Unchecked boxes are absent from FormData: send an explicit false.
    for (const name of ["passEnabled", "bannerEnabled"]) {
      formData.set(name, formData.get(name) === "on" ? "true" : "false")
    }
    setIsSubmitting(true)
    setErrors({})
    const result = await updatePassPatrimoineSettings(formData)
    setIsSubmitting(false)
    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      setErrors(result.errors ?? {})
      toast.error(result.message)
    }
  }

  const describedBy = (name: string, hint?: string) =>
    [hint, errors[name] ? `${name}-error` : null].filter(Boolean).join(" ") || undefined

  return (
    <form onSubmit={handleSubmit} noValidate>
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Ticket className="size-5 text-amber-500" aria-hidden="true" />
            Pass Patrimoine
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground text-sm">
            Le Pass Patrimoine donne accès à plus de 500 sites partenaires. Les liens vers les
            fiches se renseignent dans chaque événement ({linkedEvents} événement
            {linkedEvents > 1 ? "s publiés liés" : " publié lié"} aujourd&apos;hui).
          </p>

          <label className={toggleClass}>
            <input
              type="checkbox"
              name="passEnabled"
              defaultChecked={settings.passEnabled}
              className="mt-0.5 size-5 shrink-0 accent-amber-500"
            />
            <span>
              <span className="text-foreground block font-medium">
                Afficher le Pass Patrimoine sur les événements
              </span>
              <span className="text-muted-foreground block text-sm">
                Encart « Accessible avec le Pass Patrimoine » sur les fiches, badge sur les cartes
                et filtre « Sites du Pass Patrimoine » au programme.
              </span>
            </span>
          </label>

          <fieldset className="space-y-4 rounded-lg border border-white/10 p-4">
            <legend className="text-foreground px-1 font-medium">Bandeau de promotion</legend>
            <label className={toggleClass}>
              <input
                type="checkbox"
                name="bannerEnabled"
                defaultChecked={settings.bannerEnabled}
                className="mt-0.5 size-5 shrink-0 accent-amber-500"
              />
              <span>
                <span className="text-foreground block font-medium">Afficher le bandeau</span>
                <span className="text-muted-foreground block text-sm">
                  Discret et refermable : un visiteur qui le ferme ne le revoit plus, jusqu&apos;à
                  ce que le texte ou le lien change.
                </span>
              </span>
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="bannerTextFr" className="text-foreground">
                  Texte (FR)
                </Label>
                <Textarea
                  id="bannerTextFr"
                  name="bannerTextFr"
                  rows={3}
                  maxLength={280}
                  defaultValue={settings.bannerTextFr}
                  aria-invalid={!!errors.bannerTextFr}
                  aria-describedby={describedBy("bannerTextFr")}
                  className="mt-1 border-white/10 bg-white/5"
                />
                <FieldError id="bannerTextFr-error" errors={errors.bannerTextFr} />
              </div>
              <div>
                <Label htmlFor="bannerTextEn" className="text-foreground">
                  Texte (EN)
                </Label>
                <Textarea
                  id="bannerTextEn"
                  name="bannerTextEn"
                  rows={3}
                  maxLength={280}
                  defaultValue={settings.bannerTextEn}
                  aria-invalid={!!errors.bannerTextEn}
                  aria-describedby={describedBy("bannerTextEn")}
                  className="mt-1 border-white/10 bg-white/5"
                />
                <FieldError id="bannerTextEn-error" errors={errors.bannerTextEn} />
              </div>
            </div>

            <div>
              <Label htmlFor="bannerUrl" className="text-foreground">
                Lien du bouton « Découvrir le Pass »
              </Label>
              <Input
                id="bannerUrl"
                name="bannerUrl"
                type="url"
                defaultValue={settings.bannerUrl}
                aria-invalid={!!errors.bannerUrl}
                aria-describedby={describedBy("bannerUrl", "bannerUrl-hint")}
                className="mt-1 min-h-11 border-white/10 bg-white/5"
              />
              <p id="bannerUrl-hint" className="text-muted-foreground mt-1 text-xs">
                Une page https de pass-patrimoine.fr. Les paramètres de suivi du festival sont
                ajoutés automatiquement.
              </p>
              <FieldError id="bannerUrl-error" errors={errors.bannerUrl} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="bannerStart" className="text-foreground">
                  Début (facultatif)
                </Label>
                <Input
                  id="bannerStart"
                  name="bannerStart"
                  type="date"
                  defaultValue={settings.bannerStart ?? ""}
                  aria-invalid={!!errors.bannerStart}
                  aria-describedby={describedBy("bannerStart")}
                  className="mt-1 min-h-11 border-white/10 bg-white/5"
                />
                <FieldError id="bannerStart-error" errors={errors.bannerStart} />
              </div>
              <div>
                <Label htmlFor="bannerEnd" className="text-foreground">
                  Fin incluse (facultatif)
                </Label>
                <Input
                  id="bannerEnd"
                  name="bannerEnd"
                  type="date"
                  defaultValue={settings.bannerEnd ?? ""}
                  aria-invalid={!!errors.bannerEnd}
                  aria-describedby={describedBy("bannerEnd")}
                  className="mt-1 min-h-11 border-white/10 bg-white/5"
                />
                <FieldError id="bannerEnd-error" errors={errors.bannerEnd} />
              </div>
            </div>

            <fieldset aria-describedby={errors.bannerPages ? "bannerPages-error" : undefined}>
              <legend className="text-foreground mb-2 text-sm font-medium">
                Pages d&apos;affichage
              </legend>
              <div className="flex flex-wrap gap-3">
                {PAGE_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3"
                  >
                    <input
                      type="checkbox"
                      name="bannerPages"
                      value={option.value}
                      defaultChecked={settings.bannerPages.includes(option.value)}
                      className="size-5 accent-amber-500"
                    />
                    <span className="text-foreground text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
              <FieldError id="bannerPages-error" errors={errors.bannerPages} />
            </fieldset>
          </fieldset>

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} className="min-h-11">
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden="true" />}
              Enregistrer
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
