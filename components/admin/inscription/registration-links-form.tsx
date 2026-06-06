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
import { updateRegistrationLinks } from "@/lib/actions/registration-links"
import type { RegistrationLinkItem } from "@/lib/queries/registration-links"

type RegistrationLinksFormProps = {
  links: RegistrationLinkItem[]
}

export const RegistrationLinksForm = ({ links }: RegistrationLinksFormProps) => {
  const router = useRouter()
  const t = useTranslations("departments")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    const result = await updateRegistrationLinks(new FormData(e.currentTarget))

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
      <div className="flex items-center justify-between">
        <h1 className="font-serif text-2xl font-bold text-white">Liens d&apos;inscription</h1>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Formulaire d&apos;inscription par département</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-400">
            URL du formulaire d&apos;inscription de chaque département. Laisser vide pour masquer le
            département sur la page publique.
          </p>
          {links.map((link) => (
            <div key={link.id}>
              <Label htmlFor={link.id} className="text-slate-300">
                {t(link.department)}
              </Label>
              <Input
                id={link.id}
                name={link.id}
                type="url"
                defaultValue={link.url}
                placeholder="https://..."
                className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Enregistrer
        </Button>
      </div>
    </form>
  )
}
