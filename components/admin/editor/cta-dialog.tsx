"use client"

import { useState, type KeyboardEvent } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { normalizeLinkUrl } from "@/lib/admin/editor-urls"

type CtaValue = { href: string; label: string }

type CtaDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValue?: CtaValue
  onSubmit: (value: CtaValue) => void
  /** Shown when editing an existing button. */
  onRemove?: () => void
}

/** Same no-<form> pattern as UrlDialog: events would bubble to the admin form. */
export const CtaDialog = ({
  open,
  onOpenChange,
  initialValue,
  onSubmit,
  onRemove,
}: CtaDialogProps) => {
  const [label, setLabel] = useState(initialValue?.label ?? "")
  const [href, setHref] = useState(initialValue?.href ?? "")
  const [errors, setErrors] = useState<{ label?: string; href?: string }>({})
  const editing = !!initialValue

  const submit = () => {
    const accepted = normalizeLinkUrl(href)
    const next = {
      label: label.trim() ? undefined : "Saisissez le texte du bouton.",
      href: accepted ? undefined : "Adresse invalide : utilisez https://, /, mailto: ou tel:.",
    }
    setErrors(next)
    if (next.label || next.href || !accepted) return
    onSubmit({ href: accepted, label: label.trim() })
    onOpenChange(false)
  }

  const onEnter = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return
    e.preventDefault()
    submit()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-background border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">
            {editing ? "Modifier le bouton" : "Insérer un bouton"}
          </DialogTitle>
          <DialogDescription>
            Un lien mis en avant, par exemple vers un formulaire d&apos;inscription ou le programme.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="editor-cta-label" className="text-muted-foreground">
              Texte du bouton
            </Label>
            <Input
              id="editor-cta-label"
              value={label}
              placeholder="S'inscrire au festival"
              autoFocus
              onChange={(e) => {
                setLabel(e.target.value)
                setErrors((current) => ({ ...current, label: undefined }))
              }}
              onKeyDown={onEnter}
              className="border-white/10 bg-white/5 text-white"
              aria-invalid={!!errors.label}
              aria-describedby={errors.label ? "editor-cta-label-error" : undefined}
            />
            {errors.label && (
              <p id="editor-cta-label-error" className="text-sm text-red-400">
                {errors.label}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="editor-cta-href" className="text-muted-foreground">
              Adresse du bouton
            </Label>
            <Input
              id="editor-cta-href"
              value={href}
              placeholder="https://"
              onChange={(e) => {
                setHref(e.target.value)
                setErrors((current) => ({ ...current, href: undefined }))
              }}
              onKeyDown={onEnter}
              className="border-white/10 bg-white/5 text-white"
              aria-invalid={!!errors.href}
              aria-describedby={errors.href ? "editor-cta-href-error" : undefined}
            />
            {errors.href && (
              <p id="editor-cta-href-error" className="text-sm text-red-400">
                {errors.href}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          {onRemove && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onRemove()
                onOpenChange(false)
              }}
            >
              Retirer le bouton
            </Button>
          )}
          <Button type="button" onClick={submit}>
            {editing ? "Mettre à jour" : "Insérer le bouton"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
