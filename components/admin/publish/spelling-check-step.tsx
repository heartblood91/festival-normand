"use client"

import { CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SpellingCorrection } from "@/lib/actions/ai-publish"

type SpellingCheckStepProps = {
  corrections: SpellingCorrection[]
  isLoading: boolean
  onRegenerate: () => void
  accepted: Set<number>
  onToggleAccept: (index: number) => void
}

export const SpellingCheckStep = ({
  corrections,
  isLoading,
  onRegenerate,
  accepted,
  onToggleAccept,
}: SpellingCheckStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-semibold text-white">Spelling & Grammar</h3>
        <p className="text-sm text-slate-400">
          {corrections.length === 0
            ? "No spelling or grammar issues found."
            : `Found ${corrections.length} ${corrections.length === 1 ? "issue" : "issues"}.`}
        </p>
      </div>

      {isLoading ? (
        <div className="py-6 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="mt-2 text-sm text-slate-400">Checking spelling...</p>
        </div>
      ) : corrections.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm">Perfect spelling!</span>
        </div>
      ) : (
        <div className="space-y-3">
          {corrections.map((correction, i) => (
            <div key={i} className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="mb-1 text-xs text-slate-400">Context:</p>
                  <p className="text-sm text-slate-300 italic">{correction.context}</p>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <div className="flex-1 rounded border border-amber-500/30 bg-slate-900/50 px-2 py-1">
                  <p className="mb-1 text-xs text-slate-400">Original:</p>
                  <p className="font-mono text-sm text-red-400">{correction.original}</p>
                </div>
                <div className="text-amber-400">→</div>
                <div className="flex-1 rounded border border-green-500/30 bg-slate-900/50 px-2 py-1">
                  <p className="mb-1 text-xs text-slate-400">Suggested:</p>
                  <p className="font-mono text-sm text-green-400">{correction.corrected}</p>
                </div>
              </div>

              <Button
                type="button"
                variant={accepted.has(i) ? "default" : "outline"}
                size="sm"
                onClick={() => onToggleAccept(i)}
                className={accepted.has(i) ? "w-full bg-green-600 hover:bg-green-700" : "w-full"}
              >
                {accepted.has(i) ? "✓ Accept" : "Accept correction"}
              </Button>
            </div>
          ))}
        </div>
      )}

      {corrections.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading}
          className="w-full"
        >
          Regenerate
        </Button>
      )}
    </div>
  )
}
