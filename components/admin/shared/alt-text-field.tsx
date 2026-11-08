"use client"

import { useState } from "react"
import { Loader2, Sparkles } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { proposeAltText } from "@/lib/actions/ai-publish"
import { ALT_MAX_LENGTH } from "@/lib/admin/alt-text"
import { useAiAvailability } from "./use-ai-availability"

type AltTextFieldProps = {
  id: string
  name?: string
  label: string
  value: string
  onChange: (value: string) => void
  /** Image to describe; the AI proposal is offered only for French fields. */
  imageUrl?: string
  /** Page title or text the model may use to name the place. */
  context?: string
  error?: string
  lang?: "fr" | "en"
}

/** Alt input with an optional AI proposal the editor accepts or discards. */
export const AltTextField = ({
  id,
  name,
  label,
  value,
  onChange,
  imageUrl,
  context = "",
  error,
  lang = "fr",
}: AltTextFieldProps) => {
  const aiAvailable = useAiAvailability()
  const [proposal, setProposal] = useState("")
  const [isProposing, setIsProposing] = useState(false)
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const canPropose = lang === "fr" && !!imageUrl

  const handlePropose = async () => {
    if (!imageUrl) return
    setIsProposing(true)
    try {
      const result = await proposeAltText(imageUrl, context)
      if ("alt" in result) setProposal(result.alt)
      else toast.error(result.error)
    } catch {
      toast.error("La proposition a échoué. Réessayez plus tard.")
    } finally {
      setIsProposing(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-muted-foreground block">
        {label}
      </Label>
      <div className="flex flex-col gap-2 md:flex-row">
        <Input
          id={id}
          name={name}
          lang={lang}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={250}
          className="border-white/10 bg-white/5 text-white"
          aria-invalid={!!error}
          aria-describedby={error ? `${errorId} ${hintId}` : hintId}
        />
        {canPropose && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePropose}
            disabled={!aiAvailable || isProposing}
            title={aiAvailable === false ? "Clé OpenRouter non configurée" : undefined}
            className="shrink-0"
          >
            {isProposing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
            )}
            Proposer avec l&apos;IA
            {aiAvailable === false && <span className="sr-only"> (IA indisponible)</span>}
          </Button>
        )}
      </div>
      <p id={hintId} className="text-muted-foreground text-xs">
        Décrivez ce que l&apos;image apporte à la page ({value.length}/{ALT_MAX_LENGTH} caractères
        conseillés).
      </p>
      {error && (
        <p id={errorId} className="text-sm text-red-400">
          {error}
        </p>
      )}
      <div role="status">
        {proposal && (
          <div className="space-y-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
            <p className="text-foreground text-sm">
              <span className="font-medium text-amber-300">Proposition IA, à relire :</span>{" "}
              {proposal}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onChange(proposal)
                  setProposal("")
                }}
              >
                Utiliser cette proposition
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setProposal("")}>
                Écarter
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
