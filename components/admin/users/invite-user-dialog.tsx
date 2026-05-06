"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Copy, Mail, MailX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { inviteUser } from "@/lib/actions/users"

type InviteUserDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  emailEnabled: boolean
}

const initialForm = { email: "", role: "EDITOR" }

export const InviteUserDialog = ({ open, onOpenChange, emailEnabled }: InviteUserDialogProps) => {
  const router = useRouter()
  const [form, setForm] = useState(initialForm)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [setupUrl, setSetupUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const reset = () => {
    setForm(initialForm)
    setSetupUrl(null)
    setCopied(false)
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.email || !form.role) {
      toast.error("Veuillez remplir tous les champs.")
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("email", form.email)
    formData.append("role", form.role)

    const result = await inviteUser(formData)
    setIsSubmitting(false)

    if (!result.success) {
      toast.error(result.errors?.email?.[0] ?? result.message)
      return
    }

    if (result.setupUrl) {
      setSetupUrl(result.setupUrl)
      toast.success(result.message)
      return
    }

    toast.success(result.message)
    handleClose()
  }

  const copySetupUrl = async () => {
    if (!setupUrl) return
    try {
      await navigator.clipboard.writeText(setupUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error("Impossible de copier le lien automatiquement.")
    }
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!emailEnabled && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">
          <MailX className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p className="leading-snug">
            L&apos;envoi d&apos;email est désactivé sur cet environnement. Le lien d&apos;invitation
            s&apos;affichera après création pour que vous puissiez le partager manuellement.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="invite-email" className="block text-sm font-medium text-slate-200">
          Email
        </label>
        <Input
          id="invite-email"
          type="email"
          placeholder="utilisateur@example.com"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          disabled={isSubmitting}
          className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
          required
          autoComplete="email"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="invite-role" className="block text-sm font-medium text-slate-200">
          Rôle
        </label>
        <Select
          value={form.role}
          onValueChange={(val) => val && setForm({ ...form, role: val })}
          disabled={isSubmitting}
        >
          <SelectTrigger id="invite-role" className="border-white/10 bg-white/5 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="EDITOR">Éditeur</SelectItem>
            <SelectItem value="ADMIN">Administrateur</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DialogFooter className="gap-2 sm:gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={isSubmitting}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            "Envoi en cours..."
          ) : (
            <>
              {emailEnabled ? <Mail className="size-4" /> : <MailX className="size-4" />}
              Inviter
            </>
          )}
        </Button>
      </DialogFooter>
    </form>
  )

  const renderSetupUrl = () => (
    <div className="space-y-4">
      <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">
        Compte créé. Partagez le lien ci-dessous à <strong>{form.email}</strong>{" "}
        — il expire dans 24 heures.
      </div>
      <div className="space-y-2">
        <label htmlFor="setup-url" className="block text-sm font-medium text-slate-200">
          Lien de configuration
        </label>
        <div className="flex items-stretch gap-2">
          <Input
            id="setup-url"
            value={setupUrl ?? ""}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
            className="h-10 border-white/10 bg-white/5 font-mono text-xs text-white"
          />
          <Button
            type="button"
            variant="outline"
            onClick={copySetupUrl}
            aria-label={copied ? "Lien copié" : "Copier le lien"}
            className="h-10 w-10 shrink-0 px-0"
          >
            {copied ? <Check className="size-4 text-emerald-400" /> : <Copy className="size-4" />}
          </Button>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" onClick={handleClose}>
          Fermer
        </Button>
      </DialogFooter>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : handleClose())}>
      <DialogContent className="border-white/10 bg-white/5 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>{setupUrl ? "Lien d'invitation" : "Inviter un utilisateur"}</DialogTitle>
          <DialogDescription>
            {setupUrl
              ? "Copiez et envoyez ce lien à la personne invitée."
              : emailEnabled
                ? "Un email d'invitation lui sera envoyé."
                : "Vous obtiendrez un lien à partager après création."}
          </DialogDescription>
        </DialogHeader>

        {setupUrl ? renderSetupUrl() : renderForm()}
      </DialogContent>
    </Dialog>
  )
}
