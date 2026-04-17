"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const TwoFactorVerifyForm = () => {
  const [mode, setMode] = useState<"totp" | "backup">("totp")
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } =
      mode === "totp"
        ? await authClient.twoFactor.verifyTotp({ code })
        : await authClient.twoFactor.verifyBackupCode({ code })
    setLoading(false)
    if (error) {
      toast.error(mode === "totp" ? "Code invalide" : "Code de secours invalide")
      return
    }
    toast.success("Connexion réussie")
    window.location.href = callbackUrl
  }

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-xl">
      <CardHeader>
        <CardTitle className="text-white">
          {mode === "totp" ? "Code à 6 chiffres" : "Code de secours"}
        </CardTitle>
        <CardDescription className="text-slate-400">
          {mode === "totp"
            ? "Ouvrez votre application d'authentification et saisissez le code."
            : "Utilisez l'un des codes de secours sauvegardés lors de l'activation."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code" className="text-slate-300">
              {mode === "totp" ? "Code" : "Code de secours"}
            </Label>
            <Input
              id="code"
              type="text"
              inputMode={mode === "totp" ? "numeric" : "text"}
              maxLength={mode === "totp" ? 6 : 64}
              required
              autoFocus
              autoComplete="one-time-code"
              value={code}
              onChange={(e) =>
                setCode(mode === "totp" ? e.target.value.replace(/\D/g, "") : e.target.value.trim())
              }
              className="border-white/10 bg-white/5 text-white"
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !code}
            className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
          >
            {loading ? "Vérification…" : "Valider"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setMode(mode === "totp" ? "backup" : "totp")
              setCode("")
            }}
            className="text-sm text-slate-400 transition-colors hover:text-amber-500"
          >
            {mode === "totp"
              ? "Utiliser un code de secours à la place"
              : "Revenir au code de l'application"}
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
