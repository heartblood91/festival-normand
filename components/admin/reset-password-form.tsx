"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle, KeyRound, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"

type ResetPasswordFormProps = {
  token?: string
}

export const ResetPasswordForm = ({ token }: ResetPasswordFormProps) => {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)

  if (!token) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Lien invalide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300">
            Ce lien de réinitialisation est invalide ou a expiré. Demandez un nouveau lien
            depuis la page de connexion.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/admin/forgot-password">Demander un nouveau lien</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères.")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Les deux mots de passe ne correspondent pas.")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await authClient.resetPassword({ newPassword: password, token })

      if (error) {
        toast.error(error.message || "Le lien est invalide ou expiré.")
        return
      }

      setIsDone(true)
      setTimeout(() => router.push("/admin/login"), 2000)
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isDone) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div>
              <h2 className="text-lg font-semibold text-white">Mot de passe mis à jour</h2>
              <p className="mt-1 text-sm text-slate-400">
                Vous allez être redirigé vers la connexion…
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">Nouveau mot de passe</CardTitle>
        <CardDescription className="text-slate-400">
          Choisissez un nouveau mot de passe pour votre compte.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-slate-300">
              Nouveau mot de passe
            </Label>
            <PasswordInput
              id="new-password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              placeholder="Au moins 8 caractères"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="text-slate-300">
              Confirmer le mot de passe
            </Label>
            <PasswordInput
              id="confirm-password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              placeholder="Confirmez votre mot de passe"
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Mise à jour...
              </>
            ) : (
              <>
                <KeyRound className="mr-2 h-4 w-4" />
                Mettre à jour le mot de passe
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
