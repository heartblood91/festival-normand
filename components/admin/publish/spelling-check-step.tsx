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
        <h3 className="mb-2 font-semibold text-white">Orthographe et grammaire</h3>
        <p className="text-muted-foreground text-sm">
          {corrections.length === 0
            ? "Aucune faute détectée."
            : `${corrections.length} correction${corrections.length > 1 ? "s proposées" : " proposée"}.`}
        </p>
      </div>

      {isLoading ? (
        <div className="py-6 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-muted-foreground mt-2 text-sm">Vérification de l&apos;orthographe…</p>
        </div>
      ) : corrections.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm">Aucune faute détectée.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {corrections.map((correction, i) => (
            <div key={i} className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-4">
              <div className="mb-2 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <p className="text-muted-foreground mb-1 text-xs">Contexte :</p>
                  <p className="text-muted-foreground text-sm italic">{correction.context}</p>
                </div>
              </div>

              <div className="mb-3 flex items-center gap-2">
                <div className="bg-background/50 flex-1 rounded border border-amber-500/30 px-2 py-1">
                  <p className="text-muted-foreground mb-1 text-xs">Texte actuel :</p>
                  <p className="font-mono text-sm text-red-400">{correction.original}</p>
                </div>
                <div className="text-amber-400">→</div>
                <div className="bg-background/50 flex-1 rounded border border-green-500/30 px-2 py-1">
                  <p className="text-muted-foreground mb-1 text-xs">Proposition :</p>
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
                {accepted.has(i) ? "✓ Correction acceptée" : "Accepter la correction"}
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
          Relancer la vérification
        </Button>
      )}
    </div>
  )
}
