"use client"

import { useState } from "react"
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

type UrlDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  label: string
  initialValue?: string
  placeholder?: string
  /** Returns the value to insert, or null when it is not acceptable. */
  validate: (value: string) => string | null
  invalidMessage: string
  submitLabel: string
  onSubmit: (value: string) => void
  /** Shown when editing an existing link. */
  onRemove?: () => void
}

/**
 * Replaces window.prompt for editor URLs. No <form>: the dialog renders in a
 * portal but its React events still bubble to the admin form around the editor.
 */
export const UrlDialog = ({
  open,
  onOpenChange,
  title,
  description,
  label,
  initialValue = "",
  placeholder,
  validate,
  invalidMessage,
  submitLabel,
  onSubmit,
  onRemove,
}: UrlDialogProps) => {
  const [value, setValue] = useState(initialValue)
  const [error, setError] = useState("")

  const submit = () => {
    const accepted = validate(value)
    if (!accepted) {
      setError(invalidMessage)
      return
    }
    onSubmit(accepted)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-white/10 bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-white">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="editor-url" className="text-slate-300">
            {label}
          </Label>
          <Input
            id="editor-url"
            value={value}
            placeholder={placeholder}
            autoFocus
            onChange={(e) => {
              setValue(e.target.value)
              setError("")
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter") return
              e.preventDefault()
              submit()
            }}
            className="border-white/10 bg-white/5 text-white"
            aria-invalid={!!error}
            aria-describedby={error ? "editor-url-error" : undefined}
          />
          {error && (
            <p id="editor-url-error" className="text-sm text-red-400">
              {error}
            </p>
          )}
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
              Retirer le lien
            </Button>
          )}
          <Button type="button" onClick={submit}>
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
