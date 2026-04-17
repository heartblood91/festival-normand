"use client"

import { useEffect, useState } from "react"
import QRCode from "qrcode"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Props = { initialEnabled: boolean }

type EnrolState =
  | { step: "idle" }
  | { step: "password"; password: string }
  | { step: "verify"; totpURI: string; backupCodes: string[]; qrDataUrl: string; code: string }

export const TwoFactorSection = ({ initialEnabled }: Props) => {
  const [enabled, setEnabled] = useState(initialEnabled)
  const [state, setState] = useState<EnrolState>({ step: "idle" })
  const [loading, setLoading] = useState(false)
  const [disablePassword, setDisablePassword] = useState("")

  const totpURI = state.step === "verify" ? state.totpURI : null
  useEffect(() => {
    if (!totpURI) return
    QRCode.toDataURL(totpURI, { width: 220 }).then((qrDataUrl) => {
      setState((s) => (s.step === "verify" && !s.qrDataUrl ? { ...s, qrDataUrl } : s))
    })
  }, [totpURI])

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state.step !== "password") return
    setLoading(true)
    const { data, error } = await authClient.twoFactor.enable({ password: state.password })
    setLoading(false)
    if (error || !data) {
      toast.error(error?.message || "Mot de passe invalide")
      return
    }
    setState({
      step: "verify",
      totpURI: data.totpURI,
      backupCodes: data.backupCodes,
      qrDataUrl: "",
      code: "",
    })
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    if (state.step !== "verify") return
    setLoading(true)
    const { error } = await authClient.twoFactor.verifyTotp({ code: state.code })
    setLoading(false)
    if (error) {
      toast.error("Code invalide")
      return
    }
    toast.success("Authentification à deux facteurs activée")
    setEnabled(true)
    setState({ step: "idle" })
  }

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await authClient.twoFactor.disable({ password: disablePassword })
    setLoading(false)
    if (error) {
      toast.error(error.message || "Mot de passe invalide")
      return
    }
    toast.success("Authentification à deux facteurs désactivée")
    setEnabled(false)
    setDisablePassword("")
  }

  if (enabled) {
    return (
      <form onSubmit={handleDisable} className="max-w-md space-y-4">
        <p className="text-sm text-emerald-400">
          ✓ Authentification à deux facteurs activée
        </p>
        <div className="space-y-2">
          <Label htmlFor="disable-password">Mot de passe</Label>
          <Input
            id="disable-password"
            type="password"
            required
            autoComplete="current-password"
            value={disablePassword}
            onChange={(e) => setDisablePassword(e.target.value)}
          />
        </div>
        <Button type="submit" variant="destructive" disabled={loading}>
          {loading ? "Désactivation…" : "Désactiver la 2FA"}
        </Button>
      </form>
    )
  }

  if (state.step === "idle") {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Renforcez la sécurité de votre compte en ajoutant un code à usage unique via une
          application d&apos;authentification (Google Authenticator, 1Password, Authy…).
        </p>
        <Button onClick={() => setState({ step: "password", password: "" })}>Activer la 2FA</Button>
      </div>
    )
  }

  if (state.step === "password") {
    return (
      <form onSubmit={handleEnable} className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="enable-password">Mot de passe actuel</Label>
          <Input
            id="enable-password"
            type="password"
            required
            autoComplete="current-password"
            value={state.password}
            onChange={(e) => setState({ step: "password", password: e.target.value })}
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Vérification…" : "Continuer"}
          </Button>
          <Button type="button" variant="outline" onClick={() => setState({ step: "idle" })}>
            Annuler
          </Button>
        </div>
      </form>
    )
  }

  const secret = (() => {
    try {
      return new URL(state.totpURI).searchParams.get("secret") ?? ""
    } catch {
      return ""
    }
  })()

  const copySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret)
      toast.success("Clé copiée dans le presse-papier")
    } catch {
      toast.error("Impossible de copier la clé")
    }
  }

  return (
    <form onSubmit={handleVerify} className="max-w-md space-y-4">
      <div className="space-y-3">
        <p className="text-sm">
          Scannez ce QR code ou saisissez la clé manuellement dans votre application d&apos;authentification :
        </p>
        {state.qrDataUrl ? (
          // Data URL QR code — next/image is overkill for a dynamic base64 string
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={state.qrDataUrl}
            alt="QR code pour l'application d'authentification"
            width={220}
            height={220}
            className="rounded-lg bg-white p-2"
          />
        ) : (
          <div className="size-[220px] animate-pulse rounded-lg bg-white/10" />
        )}
        <div className="space-y-1">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Clé de configuration
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-lg border border-white/10 bg-black/30 p-2 font-mono text-xs break-all select-all">
              {secret}
            </code>
            <Button type="button" variant="outline" size="sm" onClick={copySecret}>
              Copier
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium">Codes de secours</p>
        <p className="text-muted-foreground text-xs">
          Sauvegardez ces codes dans un endroit sûr. Chaque code ne peut être utilisé qu&apos;une
          seule fois.
        </p>
        <pre className="rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-xs">
          {state.backupCodes.join("\n")}
        </pre>
      </div>

      <div className="space-y-2">
        <Label htmlFor="totp-code">Code à 6 chiffres</Label>
        <Input
          id="totp-code"
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          required
          autoComplete="one-time-code"
          value={state.code}
          onChange={(e) => setState({ ...state, code: e.target.value.replace(/\D/g, "") })}
        />
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading || state.code.length !== 6}>
          {loading ? "Vérification…" : "Activer"}
        </Button>
        <Button type="button" variant="outline" onClick={() => setState({ step: "idle" })}>
          Annuler
        </Button>
      </div>
    </form>
  )
}
