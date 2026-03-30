"use client"

import { useState } from "react"
import { Eye, Languages, Search, AccessibilityIcon, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { PreviewDrawer } from "./preview-drawer"
import Link from "next/link"

type FormActionBarProps = {
  previewUrl?: string
  isPublished: boolean
  onTogglePublish: (published: boolean) => void
  onTranslate?: () => void
  onSubmit?: () => void
  isSubmitting?: boolean
  saveLabel?: string
  backUrl?: string
}

export const FormActionBar = ({
  previewUrl,
  isPublished,
  onTogglePublish,
  onTranslate,
  onSubmit,
  isSubmitting = false,
  saveLabel = "Enregistrer",
  backUrl,
}: FormActionBarProps) => {
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleSeo = () => {
    toast.info("SEO — À venir")
  }

  const handleRgaa = () => {
    toast.info("RGAA — À venir")
  }

  return (
    <>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-3 backdrop-blur-xl">
        <div className="flex items-center gap-2">
          {backUrl ? (
            <Link href={backUrl}>
              <Button type="button" variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          ) : null}
          {isPublished ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
              Publié
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
              Brouillon
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => toast.info("Traduction — À venir")}
          >
            <Languages className="mr-2 h-4 w-4" />
            Traduire
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSeo}
          >
            <Search className="mr-2 h-4 w-4" />
            SEO
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRgaa}
          >
            <AccessibilityIcon className="mr-2 h-4 w-4" />
            RGAA
          </Button>

          {previewUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Aperçu
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            onClick={() => {
              onTogglePublish(!isPublished)
              // Auto-submit after state update so the change persists
              requestAnimationFrame(() => onSubmit?.())
            }}
            className={isPublished
              ? "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
              : "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
            }
          >
            {isPublished ? "Dépublier" : "Publier"}
          </Button>

          {onSubmit && (
            <Button
              type="button"
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {saveLabel}
            </Button>
          )}
        </div>
      </div>

      {previewUrl && (
        <PreviewDrawer
          url={previewUrl}
          open={previewOpen}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  )
}
