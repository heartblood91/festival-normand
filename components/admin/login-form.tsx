"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Mail, Loader2, CheckCircle, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"

export const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [mode, setMode] = useState<"password" | "magic-link">("password")
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) {
      toast.error("Veuillez remplir tous les champs.")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
      })

      if (error) {
        toast.error(error.message || "Email ou mot de passe incorrect.")
        setIsLoading(false)
        return
      }

      toast.success("Connexion réussie !")
      router.push(callbackUrl)
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      toast.error("Veuillez saisir votre adresse email.")
      return
    }

    setIsLoading(true)
    try {
      const { error } = await authClient.signIn.magicLink({
        email,
        callbackURL: callbackUrl,
      })

      if (error) {
        toast.error(error.message || "Une erreur est survenue.")
        setIsLoading(false)
        return
      }

      setIsSent(true)
      toast.success("Lien de connexion envoyé !")
    } catch {
      toast.error("Une erreur est survenue. Veuillez réessayer.")
    } finally {
      setIsLoading(false)
    }
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
                Un lien de connexion a été envoyé à{" "}
                <span className="font-medium text-white">{email}</span>.
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-amber-500 hover:text-amber-400"
              onClick={() => { setIsSent(false); setEmail("") }}
            >
              Utiliser une autre adresse
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">Connexion</CardTitle>
        <CardDescription className="text-slate-400">
          {mode === "password"
            ? "Connectez-vous avec votre email et mot de passe."
            : "Recevez un lien de connexion par email."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={mode === "password" ? handlePasswordLogin : handleMagicLink} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-300">Adresse email</Label>
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

          {mode === "password" && (
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              />
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
          >
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Connexion...</>
            ) : mode === "password" ? (
              <><LogIn className="mr-2 h-4 w-4" />Se connecter</>
            ) : (
              <><Mail className="mr-2 h-4 w-4" />Envoyer le lien</>
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            className="text-sm text-slate-400 hover:text-amber-500 transition-colors"
            onClick={() => setMode(mode === "password" ? "magic-link" : "password")}
          >
            {mode === "password" ? "Utiliser un lien magique" : "Se connecter avec un mot de passe"}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
