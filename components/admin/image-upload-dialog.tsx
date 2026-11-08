"use client"

import { useState } from "react"
import { ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ImageUpload } from "@/components/admin/image-upload"
import { AltTextField } from "@/components/admin/shared/alt-text-field"

type ImageUploadDialogProps = {
  onInsert: (image: { src: string; alt: string }) => void
}

export const ImageUploadDialog = ({ onInsert }: ImageUploadDialogProps) => {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [alt, setAlt] = useState("")

  const handleInsert = () => {
    if (!imageUrl || !alt.trim()) return
    onInsert({ src: imageUrl, alt: alt.trim() })
    setImageUrl("")
    setAlt("")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => setOpen(true)}
        className="text-muted-foreground h-8 w-8 hover:text-white"
        aria-label="Insérer une image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      <DialogContent className="bg-background max-h-[90dvh] overflow-y-auto border-white/10 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">Insérer une image</DialogTitle>
          <DialogDescription>
            Le texte alternatif est obligatoire : il est lu aux personnes qui ne voient pas
            l&apos;image.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ImageUpload
            value={imageUrl}
            onChange={(url) => {
              setImageUrl(url)
              setAlt("")
            }}
            preset="content"
          />
          {imageUrl && (
            <AltTextField
              id="editor-image-alt"
              label="Texte alternatif *"
              value={alt}
              onChange={setAlt}
              imageUrl={imageUrl}
            />
          )}
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleInsert} disabled={!imageUrl || !alt.trim()}>
            Insérer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
