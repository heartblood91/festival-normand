"use client"

import { useActionState, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { recoverLegacyEvents, type RecoveryActionResult } from "@/lib/actions/recovery"
import type { DirectusImportReport } from "@/lib/directus/import"
import { cn } from "@/lib/utils"

const BATCH_SIZE = 20

type RecoveryFormProps = {
  year: string
  planned: DirectusImportReport["planned"]
}

const formatDate = (iso: string) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" }).format(
    new Date(iso)
  )

const RecoveryForm = ({ year, planned }: RecoveryFormProps) => {
  const t = useTranslations("departments")
  const router = useRouter()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [state, action, pending] = useActionState<RecoveryActionResult | null, FormData>(
    recoverLegacyEvents,
    null
  )

  useEffect(() => {
    if (!state?.created) return
    setSelected(new Set())
    router.refresh()
  }, [state, router])

  const toggle = (id: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })

  const full = selected.size >= BATCH_SIZE

  if (planned.length === 0) {
    return (
      <p className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm">
        Rien à récupérer pour l&apos;édition {year} : tous les sites de l&apos;ancien site sont
        présents ici.
      </p>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="year" value={year} />
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() =>
            setSelected(new Set(planned.slice(0, BATCH_SIZE).map((item) => item.tourinsoftId)))
          }
        >
          Cocher les {Math.min(BATCH_SIZE, planned.length)} premiers
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          onClick={() => setSelected(new Set())}
        >
          Tout décocher
        </Button>
        <p className="text-muted-foreground text-sm">
          {BATCH_SIZE} sites au plus par import, pour qu&apos;un clic reste court.
        </p>
      </div>

      <fieldset>
        <legend className="sr-only">Sites de l&apos;édition {year} absents de ce site</legend>
        <ul className="divide-y divide-white/10 rounded-lg border border-white/10 bg-white/5">
          {planned.map((item) => {
            const checked = selected.has(item.tourinsoftId)
            return (
              <li
                key={item.tourinsoftId}
                className="scroll-mb-36"
                data-testid="recovery-row"
                data-tourinsoft-id={item.tourinsoftId}
              >
                <label
                  className={cn(
                    "flex min-h-11 cursor-pointer items-start gap-3 px-4 py-3",
                    !checked && full && "cursor-not-allowed opacity-60"
                  )}
                >
                  <input
                    type="checkbox"
                    name="tourinsoftId"
                    value={item.tourinsoftId}
                    checked={checked}
                    disabled={!checked && full}
                    onChange={(event) => toggle(item.tourinsoftId, event.target.checked)}
                    className="mt-0.5 size-5 shrink-0 accent-amber-500"
                  />
                  <span className="min-w-0">
                    <span className="text-foreground block font-medium break-words">
                      {item.title}
                    </span>
                    <span className="text-muted-foreground block text-sm">
                      {item.city} · {t(item.department)} · {formatDate(item.dateStart)}
                    </span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </fieldset>

      {/* Sticky so the submit stays reachable below a list of several hundred sites */}
      <div className="sticky bottom-0 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-lg border border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl">
        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input type="checkbox" name="photos" className="size-5 accent-amber-500" />
          Télécharger aussi les photos (plus long)
        </label>
        <Button
          type="submit"
          disabled={selected.size === 0 || pending}
          className="min-h-11 bg-amber-500 text-slate-950 hover:bg-amber-400"
        >
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
          Importer en brouillon ({selected.size})
        </Button>
        <p
          role="status"
          className={cn(
            "text-sm",
            state ? (state.success ? "text-emerald-300" : "text-red-300") : "sr-only"
          )}
        >
          {pending ? "Import en cours…" : (state?.message ?? "")}
        </p>
      </div>
    </form>
  )
}

export { RecoveryForm }
