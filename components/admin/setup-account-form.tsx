"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { toast } from "sonner"
import { setupAccount } from "@/lib/actions/users"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"

type SetupAccountFormProps = {
  token?: string
  email?: string
}

export const SetupAccountForm = ({ token, email }: SetupAccountFormProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const locale = pathname?.split("/")[1] === "en" ? "en" : "fr"
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token || !email) {
      toast.error("Lien d'invitation invalide.")
      return
    }

    if (!password || !confirmPassword) {
      toast.error("Veuillez remplir tous les champs.")
      return
    }

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas.")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await setupAccount({ token, email, password })

      if (!result.success) {
        toast.error(result.message)
        return
      }

      toast.success("Compte configuré. Redirection vers la connexion...")
      setTimeout(() => {
        router.push(`/${locale}/admin/login`)
      }, 1500)
    } catch {
      toast.error("Une erreur est survenue lors de la configuration du compte.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
        <h1 className="mb-4 font-serif text-2xl font-bold text-amber-500">Lien invalide</h1>
        <p className="text-slate-400">Ce lien d&apos;invitation est invalide ou a expiré.</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
      <div className="mb-8">
        <h1 className="mb-2 font-serif text-2xl font-bold text-amber-500">
          Configurer votre compte
        </h1>
        <p className="text-sm text-slate-400">
          Créez un mot de passe pour accéder à l&apos;administration.
        </p>
        <p className="mt-1 text-sm text-slate-500">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-slate-200">
            Mot de passe
          </label>
          <PasswordInput
            id="password"
            autoComplete="new-password"
            placeholder="Au moins 8 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            required
            minLength={8}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-200">
            Confirmer le mot de passe
          </label>
          <PasswordInput
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="Confirmez votre mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            required
            minLength={8}
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
          {isSubmitting ? "Configuration..." : "Créer mon compte"}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500">
        Cette page est sécurisée et utilise le chiffrement SSL.
      </p>
    </div>
  )
}
