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
import { AltTextField } from "@/components/admin/shared/alt-text-field"

/** Edits the alt of the image selected in the editor. */
export const ImageAltDialog = ({
  open,
  onOpenChange,
  src,
  initialAlt,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  initialAlt: string
  onSave: (alt: string) => void
}) => {
  const [alt, setAlt] = useState(initialAlt)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto border-white/10 bg-slate-900 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Texte alternatif de l&apos;image</DialogTitle>
          <DialogDescription>
            Décrivez ce que l&apos;image apporte au texte, sans répéter la légende.
          </DialogDescription>
        </DialogHeader>
        <AltTextField
          id="editor-selected-image-alt"
          label="Texte alternatif *"
          value={alt}
          onChange={setAlt}
          imageUrl={src}
        />
        <DialogFooter>
          <Button
            type="button"
            disabled={!alt.trim()}
            onClick={() => {
              onSave(alt.trim())
              onOpenChange(false)
            }}
          >
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
