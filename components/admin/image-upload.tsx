'use client'

import { useState, useRef } from 'react'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { ImagePreset } from '@/lib/image-config'

type ImageUploadProps = {
  value?: string
  onChange: (url: string) => void
  preset?: ImagePreset
  className?: string
}

export const ImageUpload = ({ value, onChange, preset = 'content', className = '' }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUpload = async (file: File) => {
    setIsUploading(true)
    setProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('preset', preset)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      onChange(data.url)
      setProgress(100)
      toast.success('Image uploaded successfully')
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed'
      toast.error(message)
    } finally {
      setIsUploading(false)
      setProgress(0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.add('border-amber-500/50', 'bg-amber-500/5')
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('border-amber-500/50', 'bg-amber-500/5')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.currentTarget.classList.remove('border-amber-500/50', 'bg-amber-500/5')

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleUpload(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files[0])
    }
  }

  return (
    <div className={className}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-white/20 bg-white/5 px-6 py-8 transition-colors hover:border-amber-500/30 hover:bg-amber-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
        role="button"
        tabIndex={0}
        aria-label={value ? 'Change image' : 'Upload image'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            fileInputRef.current?.click()
          }
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
          className="hidden"
          aria-hidden="true"
        />

        {isUploading ? (
          <>
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-500" />
            <div className="text-center">
              <p className="text-sm font-medium text-white">{progress}%</p>
              <p className="text-xs text-slate-400">Uploading...</p>
            </div>
          </>
        ) : value ? (
          <>
            <img
              src={value}
              alt="Uploaded"
              className="max-h-32 max-w-full rounded-lg"
            />
            <p className="text-xs text-slate-400">Click to change</p>
          </>
        ) : (
          <>
            <Upload className="h-8 w-8 text-slate-400" />
            <div className="text-center">
              <p className="text-sm font-medium text-white">Drop image here or click</p>
              <p className="text-xs text-slate-400">PNG, JPG, WebP, GIF (max 10MB)</p>
            </div>
          </>
        )}
      </div>

      {value && !isUploading && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange('')}
          className="mt-2 text-red-400 hover:text-red-300"
          aria-label="Remove image"
        >
          <X className="mr-1 h-4 w-4" />
          Remove
        </Button>
      )}
    </div>
  )
}
