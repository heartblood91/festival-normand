"use client"

import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { A11ySuggestion } from "@/lib/actions/ai-publish"
import { ISSUE_TYPE_LABELS, SEVERITY_LABELS, pointsToCheck } from "./labels"

type A11yCheckStepProps = {
  suggestions: A11ySuggestion[]
  isLoading: boolean
  onRegenerate: () => void
  dismissed: Set<string>
  onDismiss: (index: number) => void
}

const severityConfig = {
  error: {
    icon: AlertCircle,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  warning: {
    icon: AlertTriangle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
}

export const A11yCheckStep = ({
  suggestions,
  isLoading,
  onRegenerate,
  dismissed,
  onDismiss,
}: A11yCheckStepProps) => {
  const active = suggestions.filter((_, i) => !dismissed.has(`a11y-${i}`))

  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 font-semibold text-white">Accessibilité (RGAA)</h3>
        <p className="text-muted-foreground text-sm">
          {active.length === 0
            ? "Aucun point d'accessibilité détecté."
            : pointsToCheck(active.length, "d'accessibilité")}
        </p>
      </div>

      {isLoading ? (
        <div className="py-6 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
          <p className="text-muted-foreground mt-2 text-sm">
            Vérification de l&apos;accessibilité…
          </p>
        </div>
      ) : active.length === 0 ? (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-green-400">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span className="text-sm">Aucun point d&apos;accessibilité détecté.</span>
        </div>
      ) : (
        <div className="space-y-3">
          {active.map((suggestion, i) => {
            const config = severityConfig[suggestion.severity]
            const IconComponent = config.icon
            return (
              <div key={i} className={`rounded-lg border ${config.border} ${config.bg} p-4`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-1 items-start gap-3">
                    <IconComponent className={`mt-0.5 h-5 w-5 shrink-0 ${config.color}`} />
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                          {ISSUE_TYPE_LABELS[suggestion.type] ?? suggestion.type}
                        </span>
                        <span className={`text-xs font-bold uppercase ${config.color}`}>
                          {SEVERITY_LABELS[suggestion.severity] ?? suggestion.severity}
                        </span>
                      </div>
                      <p className="text-foreground text-sm">{suggestion.message}</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onDismiss(i)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Ignorer
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {suggestions.length > 0 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isLoading}
          className="w-full"
        >
          Relancer l&apos;analyse
        </Button>
      )}
    </div>
  )
}
