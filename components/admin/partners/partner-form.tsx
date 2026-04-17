"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TranslateButton } from "@/components/admin/translate-button"
import { ImageUpload } from "@/components/admin/image-upload"
import { createPartner, updatePartner } from "@/lib/actions/partners"
import type { Partner } from "@prisma/client"

type PartnerFormProps = {
  partner?: Partner
}

export const PartnerForm = ({ partner }: PartnerFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [formLocale, setFormLocale] = useState<"fr" | "en">("fr")
  const [nameFr, setNameFr] = useState(partner?.nameFr ?? "")
  const [nameEn, setNameEn] = useState(partner?.nameEn ?? "")
  const [logo, setLogo] = useState(partner?.logo ?? "")

  const handleTranslated = (translations: Record<string, string>) => {
    if (translations.nameEn) setNameEn(translations.nameEn)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    formData.set("nameFr", nameFr)
    formData.set("nameEn", nameEn)
    formData.set("logo", logo)

    const result = partner
      ? await updatePartner(partner.id, formData)
      : await createPartner(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push("/admin/partners")
      router.refresh()
    } else {
      toast.error(result.message)
      if (result.errors) {
        setErrors(result.errors)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/partners">
          <Button type="button" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {partner ? "Mettre à jour" : "Créer le partenaire"}
        </Button>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Informations</CardTitle>
          <div className="flex items-center gap-2">
            <div className="inline-flex gap-1 rounded-lg border border-white/10 p-1">
              <button
                type="button"
                onClick={() => setFormLocale("fr")}
                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                  formLocale === "fr"
                    ? "bg-amber-500 text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setFormLocale("en")}
                className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
                  formLocale === "en"
                    ? "bg-amber-500 text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {formLocale === "fr" ? (
            <div>
              <Label htmlFor="nameFr" className="text-slate-300">
                Nom *
              </Label>
              <Input
                id="nameFr"
                name="nameFr"
                value={nameFr}
                onChange={(e) => setNameFr(e.target.value)}
                required
                className="mt-1 border-white/10 bg-white/5 text-white"
                aria-invalid={!!errors.nameFr}
                aria-describedby={errors.nameFr ? "nameFr-error" : undefined}
              />
              {errors.nameFr && (
                <p id="nameFr-error" className="mt-1 text-sm text-red-400">
                  {errors.nameFr[0]}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Traduction automatique</span>
                <TranslateButton
                  sourceFields={{
                    nameFr,
                  }}
                  onTranslated={handleTranslated}
                />
              </div>

              <div>
                <Label htmlFor="nameEn" className="text-slate-300">
                  Name
                </Label>
                <Input
                  id="nameEn"
                  name="nameEn"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  className="mt-1 border-white/10 bg-white/5 text-white"
                  aria-describedby={errors.nameEn ? "nameEn-error" : undefined}
                />
                {errors.nameEn && (
                  <p id="nameEn-error" className="mt-1 text-sm text-red-400">
                    {errors.nameEn[0]}
                  </p>
                )}
              </div>
            </>
          )}

          <div>
            <Label className="mb-2 block text-slate-300">Logo</Label>
            <ImageUpload value={logo} onChange={setLogo} preset="logo" />
          </div>

          <div>
            <Label htmlFor="website" className="text-slate-300">
              Site web
            </Label>
            <Input
              id="website"
              name="website"
              type="url"
              defaultValue={partner?.website ?? ""}
              placeholder="https://..."
              className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              aria-invalid={!!errors.website}
              aria-describedby={errors.website ? "website-error" : undefined}
            />
            {errors.website && (
              <p id="website-error" className="mt-1 text-sm text-red-400">
                {errors.website[0]}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="order" className="text-slate-300">
              Ordre d&apos;affichage
            </Label>
            <Input
              id="order"
              name="order"
              type="number"
              min="0"
              defaultValue={partner?.order ?? 0}
              className="mt-1 border-white/10 bg-white/5 text-white"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/admin/partners">
          <Button type="button" variant="ghost">
            Annuler
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {partner ? "Mettre à jour" : "Créer le partenaire"}
        </Button>
      </div>
    </form>
  )
}
