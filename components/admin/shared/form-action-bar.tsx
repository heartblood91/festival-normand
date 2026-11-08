"use client"

import { useState } from "react"
import { Eye, Languages, Search, AccessibilityIcon, ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button, buttonVariants } from "@/components/ui/button"
import { PreviewDrawer } from "./preview-drawer"
import { AiCheckDialog, type AiCheckKind } from "./ai-check-dialog"
import { useAiAvailability } from "./use-ai-availability"
import Link from "next/link"

/** French source analysed by the SEO/RGAA checks, and the EN auto-fill. */
export type FormAiTools = {
  title: string
  content: string
  /** Fills empty EN fields; resolves to the number of fields filled. */
  translateMissing: () => Promise<number>
}

type FormActionBarProps = {
  previewUrl?: string
  /** Omitted for content without a publication state (static pages). */
  isPublished?: boolean
  /** Unsaved changes in the form. */
  isDirty?: boolean
  onTogglePublish?: (published: boolean) => void
  ai?: FormAiTools
  onSubmit?: () => void
  isSubmitting?: boolean
  saveLabel?: string
  backUrl?: string
}

export const FormActionBar = ({
  previewUrl,
  isPublished,
  isDirty = false,
  onTogglePublish,
  ai,
  onSubmit,
  isSubmitting = false,
  saveLabel = "Enregistrer",
  backUrl,
}: FormActionBarProps) => {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [check, setCheck] = useState<AiCheckKind | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)
  const aiAvailable = useAiAvailability()
  const aiDisabled = !aiAvailable || isTranslating

  const handleTranslate = async () => {
    if (!ai) return
    setIsTranslating(true)
    try {
      const filled = await ai.translateMissing()
      if (filled > 0) {
        toast.success(`${filled} champ(s) anglais pré-rempli(s) : relisez l'onglet EN.`)
      } else {
        toast.info("Rien à traduire : les champs anglais sont déjà remplis.")
      }
    } catch {
      toast.error("La traduction a échoué. Réessayez plus tard.")
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <>
      {/* No backdrop filter below md: it would trap the fixed bottom actions. */}
      <div className="bg-background/95 sticky top-0 z-10 flex flex-wrap items-center justify-between gap-2 border-b border-white/10 px-3 py-3 md:bg-white/5 md:px-6 md:backdrop-blur-xl">
        <div className="flex flex-wrap items-center gap-2">
          {backUrl ? (
            <Link
              href={backUrl}
              aria-label="Retour à la liste"
              className={buttonVariants({ variant: "ghost", size: "sm" })}
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : null}
          {isPublished === undefined ? null : isPublished ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
              Publié
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
              Brouillon
            </span>
          )}
          {/* Always rendered so screen readers announce the change. */}
          <span role="status" className="text-xs whitespace-nowrap text-amber-300">
            {isDirty ? "Modifications non enregistrées" : ""}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {ai && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTranslate}
                disabled={aiDisabled}
                aria-describedby={aiAvailable === false ? "ai-unavailable" : undefined}
              >
                {isTranslating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Languages className="mr-2 h-4 w-4" />
                )}
                Traduire
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCheck("seo")}
                disabled={aiDisabled}
                aria-describedby={aiAvailable === false ? "ai-unavailable" : undefined}
              >
                <Search className="mr-2 h-4 w-4" />
                SEO
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCheck("a11y")}
                disabled={aiDisabled}
                aria-describedby={aiAvailable === false ? "ai-unavailable" : undefined}
              >
                <AccessibilityIcon className="mr-2 h-4 w-4" />
                RGAA
              </Button>
              {aiAvailable === false && (
                <span
                  id="ai-unavailable"
                  title="Clé OpenRouter non configurée sur cet environnement"
                  className="text-muted-foreground text-xs whitespace-nowrap"
                >
                  IA indisponible
                  <span className="sr-only"> (clé OpenRouter non configurée)</span>
                </span>
              )}
            </>
          )}

          {previewUrl && (
            <Button type="button" variant="outline" size="sm" onClick={() => setPreviewOpen(true)}>
              <Eye className="mr-2 h-4 w-4" />
              Aperçu
            </Button>
          )}

          <div className="bg-background/95 fixed inset-x-0 bottom-0 z-30 flex justify-end gap-2 border-t border-white/10 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] empty:hidden md:static md:z-auto md:border-0 md:bg-transparent md:p-0">
            {onTogglePublish && isPublished !== undefined && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onTogglePublish(!isPublished)
                  // Auto-submit after state update so the change persists
                  requestAnimationFrame(() => onSubmit?.())
                }}
                className={
                  isPublished
                    ? "border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                }
              >
                {isPublished ? "Dépublier" : "Publier"}
              </Button>
            )}

            {onSubmit && (
              <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saveLabel}
              </Button>
            )}
          </div>
        </div>
      </div>

      {ai && check && (
        <AiCheckDialog
          kind={check}
          title={ai.title}
          content={ai.content}
          onClose={() => setCheck(null)}
        />
      )}

      {previewUrl && (
        <PreviewDrawer url={previewUrl} open={previewOpen} onClose={() => setPreviewOpen(false)} />
      )}
    </>
  )
}
