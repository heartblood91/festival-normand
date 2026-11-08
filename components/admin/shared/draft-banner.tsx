"use client"

import { History } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { FormDraft } from "@/lib/admin/form-draft"

const savedAtFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Europe/Paris",
})

export const DraftBanner = ({
  draft,
  onRestore,
  onDiscard,
}: {
  draft: FormDraft
  onRestore: () => void
  onDiscard: () => void
}) => (
  <section
    aria-labelledby="draft-banner-title"
    className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 md:flex-row md:items-center md:justify-between"
  >
    <div className="flex items-start gap-3">
      <History className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
      <div>
        <h2 id="draft-banner-title" className="text-sm font-semibold text-white">
          Brouillon non enregistré
        </h2>
        <p className="text-muted-foreground text-sm">
          Des modifications du {savedAtFormat.format(draft.savedAt)} n&apos;ont pas été enregistrées
          sur ce formulaire.
        </p>
      </div>
    </div>
    <div className="flex gap-2">
      <Button type="button" size="sm" onClick={onRestore}>
        Restaurer le brouillon
      </Button>
      <Button type="button" size="sm" variant="outline" onClick={onDiscard}>
        Ignorer
      </Button>
    </div>
  </section>
)
