'use client'

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/admin/image-upload'

type ImageUploadDialogProps = {
  onInsert: (url: string) => void
}

export const ImageUploadDialog = ({ onInsert }: ImageUploadDialogProps) => {
  const [open, setOpen] = useState(false)
  const [imageUrl, setImageUrl] = useState('')

  const handleInsert = () => {
    if (imageUrl) {
      onInsert(imageUrl)
      setImageUrl('')
      setOpen(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        onClick={() => setOpen(true)}
        className="h-8 w-8 text-slate-400 hover:text-white"
        aria-label="Insert image"
      >
        <ImageIcon className="h-4 w-4" />
      </Button>

      <DialogContent className="border-white/10 bg-slate-900">
        <DialogHeader>
          <DialogTitle className="text-white">Insert Image</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <ImageUpload
            value={imageUrl}
            onChange={setImageUrl}
            preset="content"
          />

          <Button
            onClick={handleInsert}
            disabled={!imageUrl}
            className="w-full bg-amber-500 hover:bg-amber-600"
          >
            Insert
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
