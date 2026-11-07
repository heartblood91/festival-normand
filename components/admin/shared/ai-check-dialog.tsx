"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { SEOCheckStep } from "@/components/admin/publish/seo-check-step"
import { A11yCheckStep } from "@/components/admin/publish/a11y-check-step"
import {
  checkAccessibility,
  checkSEO,
  type A11ySuggestion,
  type SEOSuggestion,
} from "@/lib/actions/ai-publish"

export type AiCheckKind = "seo" | "a11y"

type AiCheckDialogProps = {
  kind: AiCheckKind
  title: string
  content: string
  onClose: () => void
}

const HEADINGS: Record<AiCheckKind, { title: string; description: string }> = {
  seo: {
    title: "Vérification SEO",
    description: "Suggestions de l'IA sur le titre, la structure et les mots-clés (texte FR).",
  },
  a11y: {
    title: "Vérification RGAA",
    description:
      "Suggestions de l'IA sur les titres, textes de liens et alternatives d'images (texte FR).",
  },
}

// Mounted only while open, so every opening analyses the current text.
export const AiCheckDialog = ({ kind, title, content, onClose }: AiCheckDialogProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [suggestions, setSuggestions] = useState<(SEOSuggestion | A11ySuggestion)[]>([])
  const [dismissed, setDismissed] = useState<Set<string>>(new Set())

  const run = async () => {
    setIsLoading(true)
    setDismissed(new Set())
    try {
      setSuggestions(
        kind === "seo" ? await checkSEO(title, content, "fr") : await checkAccessibility(content)
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    run()
    // Runs once per opening, on the text at that moment.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dismiss = (index: number) =>
    setDismissed((previous) => new Set(previous).add(`${kind}-${index}`))

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl border-white/10 bg-slate-950 text-white">
        <DialogHeader>
          <DialogTitle>{HEADINGS[kind].title}</DialogTitle>
          <DialogDescription>{HEADINGS[kind].description}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[70vh] overflow-y-auto py-2">
          {kind === "seo" ? (
            <SEOCheckStep
              suggestions={suggestions as SEOSuggestion[]}
              isLoading={isLoading}
              onRegenerate={run}
              dismissed={dismissed}
              onDismiss={dismiss}
            />
          ) : (
            <A11yCheckStep
              suggestions={suggestions as A11ySuggestion[]}
              isLoading={isLoading}
              onRegenerate={run}
              dismissed={dismissed}
              onDismiss={dismiss}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
