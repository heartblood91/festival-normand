"use client"

import { Copy, Check } from "lucide-react"
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
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(null), 2000)
  }

  const entries = Object.entries(sourceFields).filter(([_, v]) => v?.trim())

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-semibold text-white">Review Translation</h3>
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
        <div className="max-h-[400px] space-y-4 overflow-y-auto">
          {entries.map(([key, sourceValue]) => (
            <div key={key} className="rounded-lg border border-white/10 bg-white/5 p-4">
              <p className="mb-2 text-xs font-semibold tracking-wide text-amber-400 uppercase">
                {key}
              </p>

              <div className="mb-3 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-1 text-xs text-slate-400">Source</p>
                  <div className="rounded border border-white/5 bg-slate-900/50 p-3">
                    <p className="text-sm whitespace-pre-wrap text-slate-200">{sourceValue}</p>
                  </div>
                </div>

                <div>
                  <p className="mb-1 text-xs text-slate-400">Translation</p>
                  <textarea
                    value={translatedFields[key] || ""}
                    onChange={(e) => onEdit(key, e.target.value)}
                    className="w-full resize-none rounded border border-amber-500/20 bg-slate-900/50 p-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
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
                    <Check className="mr-1.5 h-3.5 w-3.5" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1.5 h-3.5 w-3.5" />
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
