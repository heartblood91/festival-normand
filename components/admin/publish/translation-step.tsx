"use client"

import { Loader2, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"

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
  targetLocale,
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
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(null), 2000)
  }

  const entries = Object.entries(sourceFields).filter(([_, v]) => v?.trim())

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-white mb-2">Review Translation</h3>
        <p className="text-sm text-slate-400">
          {sourceLocale === "fr" ? "French → English" : "English → French"}
        </p>
      </div>

      {isLoading ? (
        <div className="py-6 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="mt-2 text-sm text-slate-400">Translating content...</p>
        </div>
      ) : (
        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {entries.map(([key, sourceValue]) => (
            <div key={key} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-400 font-semibold mb-2">
                {key}
              </p>

              <div className="grid gap-4 md:grid-cols-2 mb-3">
                <div>
                  <p className="text-xs text-slate-400 mb-1">Source</p>
                  <div className="p-3 rounded bg-slate-900/50 border border-white/5">
                    <p className="text-sm text-slate-200 whitespace-pre-wrap">
                      {sourceValue}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-xs text-slate-400 mb-1">Translation</p>
                  <textarea
                    value={translatedFields[key] || ""}
                    onChange={(e) => onEdit(key, e.target.value)}
                    className="w-full p-3 rounded bg-slate-900/50 border border-amber-500/20 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20 resize-none"
                    rows={3}
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(translatedFields[key] || "", key)}
                className="text-slate-400 hover:text-slate-200"
              >
                {copied === key ? (
                  <>
                    <Check className="h-3.5 w-3.5 mr-1.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
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
          Regenerate Translation
        </Button>
      )}
    </div>
  )
}
