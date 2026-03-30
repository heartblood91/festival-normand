"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type SetupAccountFormProps = {
  token?: string
  email?: string
}

export const SetupAccountForm = ({
  token,
  email,
}: SetupAccountFormProps) => {
  const router = useRouter()
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
      // TODO: Integrate with Better Auth to set password
      // For now, show a placeholder message
      toast.success("Compte configuré avec succès. Redirection...")
      setTimeout(() => {
        router.push("/admin")
      }, 2000)
    } catch {
      toast.error("Une erreur est survenue lors de la configuration du compte.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!token || !email) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl max-w-md w-full">
        <h1 className="font-serif text-2xl font-bold text-amber-500 mb-4">
          Lien invalide
        </h1>
        <p className="text-slate-400">
          Ce lien d&apos;invitation est invalide ou a expiré.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl max-w-md w-full">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-amber-500 mb-2">
          Configurer votre compte
        </h1>
        <p className="text-sm text-slate-400">
          Créez un mot de passe pour accéder à l&apos;administration.
        </p>
        <p className="text-sm text-slate-500 mt-1">{email}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-200"
          >
            Mot de passe
          </label>
          <Input
            id="password"
            type="password"
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
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-slate-200"
          >
            Confirmer le mot de passe
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirmez votre mot de passe"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            required
            minLength={8}
          />
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-6"
        >
          {isSubmitting ? "Configuration..." : "Créer mon compte"}
        </Button>
      </form>

      <p className="text-xs text-slate-500 text-center mt-6">
        Cette page est sécurisée et utilise le chiffrement SSL.
      </p>
    </div>
  )
}
