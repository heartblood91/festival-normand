"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { findMissingSocialLinks } from "@/lib/actions/community"

type SocialBulkSearchProps = {
  missing: number
}

/** Searches official websites for social pages, batch after batch, until none is left. */
export const SocialBulkSearch = ({ missing }: SocialBulkSearchProps) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState("")

  const handleSearch = () =>
    startTransition(async () => {
      let processed = 0
      let found = 0
      let remaining = missing
      while (remaining > 0) {
        const result = await findMissingSocialLinks()
        if (!result.success) {
          // Batches already done are saved: show them, without claiming the search finished.
          setStatus(
            `${processed} site${processed > 1 ? "s" : ""} analysé${processed > 1 ? "s" : ""}.`
          )
          toast.error(result.message)
          router.refresh()
          return
        }
        processed += result.processed
        found += result.found
        remaining = result.processed > 0 ? result.remaining : 0
        setStatus(
          `${processed} site${processed > 1 ? "s" : ""} analysé${processed > 1 ? "s" : ""}…`
        )
      }
      const summary = `Recherche terminée : réseaux trouvés pour ${found} site${found > 1 ? "s" : ""} sur ${processed}.`
      setStatus(summary)
      toast.success(summary)
      router.refresh()
    })

  if (missing === 0 && !status) return null

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
      <p className="text-muted-foreground text-sm">
        {missing > 0
          ? `${missing} site${missing > 1 ? "s ont" : " a"} un site officiel mais aucun réseau social renseigné.`
          : "Tous les sites officiels ont été analysés."}{" "}
        <span role="status">{status}</span>
      </p>
      {missing > 0 ? (
        <Button
          type="button"
          variant="outline"
          className="min-h-11 w-full md:w-auto"
          disabled={isPending}
          onClick={handleSearch}
        >
          <Share2 className="mr-2 h-4 w-4" aria-hidden="true" />
          {isPending ? "Recherche en cours…" : "Chercher les réseaux sociaux"}
        </Button>
      ) : null}
    </div>
  )
}
