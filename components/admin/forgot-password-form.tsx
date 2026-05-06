"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle, Loader2, Mail } from "lucide-react"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ForgotPasswordFormProps = {
  emailEnabled: boolean
}

export const ForgotPasswordForm = ({ emailEnabled }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      toast.error("Veuillez saisir votre adresse email.")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/fr/admin/reset-password",
      })

      if (error) {
        toast.error(error.message || "Une erreur est survenue.")
        return
      }

      // Always show the same confirmation regardless of whether the email
      // matched a real user — avoids account enumeration.
      setIsSent(true)
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!emailEnabled) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Mot de passe oublié</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300">
            L&apos;envoi d&apos;email est désactivé sur cet environnement. Cette fonctionnalité
            n&apos;est pas disponible — contactez un administrateur pour réinitialiser votre mot
            de passe manuellement.
          </p>
          <Button asChild variant="outline" className="w-full">
            <Link href="/admin/login">Retour à la connexion</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (isSent) {
    return (
      <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <CheckCircle className="h-12 w-12 text-green-500" />
            <div>
              <h2 className="text-lg font-semibold text-white">Email envoyé !</h2>
              <p className="mt-1 text-sm text-slate-400">
                Si un compte existe avec l&apos;adresse{" "}
                <span className="font-medium text-white">{email}</span>, un lien de
                réinitialisation vient de lui être envoyé.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href="/admin/login">Retour à la connexion</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">Mot de passe oublié</CardTitle>
        <CardDescription className="text-slate-400">
          Recevez un lien de réinitialisation par email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">
              Adresse email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@pierresenlumieres.fr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
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
                Envoi...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer le lien
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/admin/login"
            className="text-sm text-slate-400 underline-offset-2 transition-colors hover:text-amber-500 hover:underline"
          >
            Retour à la connexion
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
