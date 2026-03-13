"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Mail, Loader2, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"

export const LoginForm = () => {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"

  const handleSubmit = async (e: React.FormEvent) => {
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
              <h2 className="text-lg font-semibold text-white">
                Email envoyé !
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Un lien de connexion a été envoyé à{" "}
                <span className="font-medium text-white">{email}</span>.
                Vérifiez votre boîte de réception.
              </p>
            </div>
            <Button
              variant="ghost"
              className="text-amber-500 hover:text-amber-400"
              onClick={() => {
                setIsSent(false)
                setEmail("")
              }}
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
          Entrez votre adresse email pour recevoir un lien de connexion.
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
                Envoi en cours...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Envoyer le lien de connexion
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
