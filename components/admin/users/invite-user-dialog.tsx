"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
}

export const InviteUserDialog = ({
  open,
  onOpenChange,
}: InviteUserDialogProps) => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("EDITOR")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !role) {
      toast.error("Veuillez remplir tous les champs.")
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append("email", email)
    formData.append("role", role)

    const result = await inviteUser(formData)
    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      setEmail("")
      setRole("EDITOR")
      onOpenChange(false)
      router.refresh()
    } else {
      if (result.errors?.email) {
        toast.error(result.errors.email[0])
      } else {
        toast.error(result.message)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-white/5 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle>Inviter un utilisateur</DialogTitle>
          <DialogDescription>
            Invitez un nouvel utilisateur à rejoindre l&apos;administration. Un
            email de confirmation sera envoyé.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-200"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              placeholder="utilisateur@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              className="border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="role"
              className="block text-sm font-medium text-slate-200"
            >
              Rôle
            </label>
            <Select
              value={role}
              onValueChange={(val) => val && setRole(val)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="border-white/10 bg-white/5 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EDITOR">Éditeur</SelectItem>
                <SelectItem value="ADMIN">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Envoi en cours..." : "Inviter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
