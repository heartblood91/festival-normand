"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2, SpellCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  correctImportedTextsBatch,
  type TextCorrectionActionResult,
} from "@/lib/actions/text-correction"
import { cn } from "@/lib/utils"

type TextCorrectionCardProps = {
  pending: number
  aiConfigured: boolean
}

/** Proofreads imported events that arrived before AI correction, ten at a time. */
export const TextCorrectionCard = ({ pending, aiConfigured }: TextCorrectionCardProps) => {
  const router = useRouter()
  const [result, setResult] = useState<TextCorrectionActionResult | null>(null)
  const [running, startTransition] = useTransition()

  if (pending === 0 && !result) return null

  const run = () =>
    startTransition(async () => {
      setResult(await correctImportedTextsBatch())
      router.refresh()
    })

  return (
    <section
      aria-labelledby="text-correction-title"
      className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <h2
        id="text-correction-title"
        className="text-foreground flex items-center gap-2 font-serif text-lg font-bold"
      >
        <SpellCheck className="size-5 text-amber-500" aria-hidden="true" />
        Correction des textes importés
      </h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Les fiches Tourinsoft et celles de l&apos;ancien site sont relues par l&apos;IA :
        orthographe, majuscules et typographie, sans changer les informations. Le texte
        d&apos;origine reste conservé sur chaque fiche.
      </p>
      <p className="text-foreground mt-3 text-sm font-medium">
        {pending === 0
          ? "Toutes les fiches importées sont relues."
          : `${pending} fiche${pending > 1 ? "s" : ""} à relire.`}
      </p>
      {pending > 0 &&
        (aiConfigured ? (
          <Button type="button" onClick={run} disabled={running} className="mt-3 min-h-11">
            {running && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
            {running ? "Relecture en cours…" : "Relire les 10 suivantes"}
          </Button>
        ) : (
          <p className="mt-3 text-sm text-amber-300">
            Ajoutez la clé OpenRouter (OPENROUTER_API_KEY) sur le serveur pour lancer la relecture.
          </p>
        ))}
      <p
        role="status"
        className={cn(
          "mt-3 text-sm",
          result?.success ? "text-emerald-300" : "text-red-300",
          !result && "sr-only"
        )}
      >
        {result?.message}
      </p>
    </section>
  )
}
