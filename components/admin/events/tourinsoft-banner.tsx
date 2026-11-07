import { RefreshCw } from "lucide-react"
import { syncedFieldsSummary } from "@/lib/tourinsoft/synced-fields"

type TourinsoftBannerProps = {
  updatedAt: Date | null
}

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("fr-FR", { dateStyle: "long", timeZone: "Europe/Paris" }).format(date)

/** Tells editors which fields the next Tourinsoft update will overwrite. */
export const TourinsoftBanner = ({ updatedAt }: TourinsoftBannerProps) => (
  <section
    aria-labelledby="tourinsoft-banner-title"
    className="rounded-lg border border-violet-500/30 bg-violet-500/10 p-4 text-sm text-violet-100"
  >
    <h2 id="tourinsoft-banner-title" className="flex items-center gap-2 font-semibold text-white">
      <RefreshCw className="size-4 text-violet-300" aria-hidden="true" />
      Fiche synchronisée depuis Tourinsoft
    </h2>
    <p className="mt-1">
      {updatedAt ? `Dernière mise à jour Tourinsoft : ${formatDate(new Date(updatedAt))}. ` : ""}
      Quand la fiche change dans Tourinsoft, la synchronisation remplace ces champs : corrigez-les
      plutôt dans Tourinsoft. La publication, la mise en avant, l&apos;accessibilité et les textes
      alternatifs restent les vôtres.
    </p>
    <details className="mt-2">
      <summary className="min-h-11 cursor-pointer content-center text-violet-300 underline-offset-4 hover:underline">
        Champs remplacés par la synchronisation
      </summary>
      <p className="mt-1 text-violet-200">
        {syncedFieldsSummary()}. Les traductions anglaises de ces champs sont refaites quand le
        français change.
      </p>
    </details>
  </section>
)
