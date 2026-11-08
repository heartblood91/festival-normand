"use client"

import { Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { FIELD_LABELS } from "./labels"

type TranslationStepProps = {
  sourceLocale: string
  targetLocale: string
  sourceFields: Record<string, string>
  translatedFields: Record<string, string>
  isLoading: boolean
  onRegenerate: () => void
  onEdit: (fieldName: string, value: string) => void
}

export const TranslationStep = ({
  sourceLocale,
  targetLocale: _targetLocale,
  sourceFields,
  translatedFields,
  isLoading,
  onRegenerate,
  onEdit,
}: TranslationStepProps) => {
  const [copied, setCopied] = useState<string | null>(null)

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text)
    setCopied(fieldName)
    toast.success("Copié dans le presse-papiers")
    setTimeout(() => setCopied(null), 2000)
  }

  const entries = Object.entries(sourceFields).filter(([_, v]) => v?.trim())

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-semibold text-white">Relire la traduction</h3>
        <p className="text-muted-foreground text-sm">
          {sourceLocale === "fr" ? "Français → anglais" : "Anglais → français"}
        </p>
      </div>

      {isLoading ? (
        <div className="py-6 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-muted-foreground mt-2 text-sm">Traduction en cours…</p>
        </div>
      ) : entries.length === 0 ? (
        <p className="text-muted-foreground rounded-lg border border-white/10 bg-white/5 p-4 text-sm">
          Aucun champ à traduire : les traductions existantes sont conservées.
        </p>
      ) : (
        <div className="max-h-[400px] space-y-4 overflow-y-auto">
          {entries.map(([key, sourceValue]) => (
            <div key={key} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs font-semibold tracking-wide text-amber-400 uppercase">
                {FIELD_LABELS[key] ?? key}
              </p>

              <div className="mb-3 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Texte source</p>
                  <div className="bg-background/50 rounded border border-white/5 p-3">
                    <p className="text-foreground text-sm whitespace-pre-wrap">{sourceValue}</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted-foreground mb-1 text-xs">Traduction</p>
                  <textarea
                    value={translatedFields[key] || ""}
                    onChange={(e) => onEdit(key, e.target.value)}
                    aria-label={`Traduction : ${FIELD_LABELS[key] ?? key}`}
                    className="bg-background/50 text-foreground placeholder:text-muted-foreground w-full resize-none rounded border border-amber-500/20 p-3 text-sm focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                    rows={3}
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(translatedFields[key] || "", key)}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied === key ? (
                  <>
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Copié
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
                    Copier
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {entries.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading}
          className="w-full"
        >
          Relancer la traduction
        </Button>
      )}
    </div>
  )
}
