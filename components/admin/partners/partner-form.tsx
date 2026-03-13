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
import { createPartner, updatePartner } from "@/lib/actions/partners"
import type { Partner } from "@prisma/client"

type PartnerFormProps = {
  partner?: Partner
}

export const PartnerForm = ({ partner }: PartnerFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)

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
        <CardHeader>
          <CardTitle className="text-white">Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-slate-300">
              Nom *
            </Label>
            <Input
              id="name"
              name="name"
              defaultValue={partner?.name ?? ""}
              required
              className="mt-1 border-white/10 bg-white/5 text-white"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : undefined}
            />
            {errors.name && (
              <p id="name-error" className="mt-1 text-sm text-red-400">
                {errors.name[0]}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="logo" className="text-slate-300">
              URL du logo
            </Label>
            <Input
              id="logo"
              name="logo"
              defaultValue={partner?.logo ?? ""}
              placeholder="https://..."
              className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              L&apos;upload vers Vercel Blob sera disponible prochainement.
            </p>
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
