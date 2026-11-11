import Link from "next/link"
import { previewLegacyRecovery } from "@/lib/actions/recovery"
import { RecoveryForm } from "@/components/admin/recovery/recovery-form"
import { cn } from "@/lib/utils"

export const metadata = {
  title: "Sites à récupérer - Administration",
  robots: { index: false, follow: false },
}

// Reads the live v1 API on every visit: the list must reflect this database now.
export const dynamic = "force-dynamic"

const DEFAULT_YEAR = "2026"

type RecoveryPageProps = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ year?: string }>
}

const loadPreview = async (year: string) => {
  try {
    return { preview: await previewLegacyRecovery(year), error: null }
  } catch (error) {
    return {
      preview: null,
      error: error instanceof Error ? error.message : "Ancien site injoignable.",
    }
  }
}

const AdminRecoveryRoute = async ({ params, searchParams }: RecoveryPageProps) => {
  const { locale } = await params
  const { year: requested } = await searchParams
  const year = requested && /^\d{4}$/.test(requested) ? requested : DEFAULT_YEAR
  const { preview, error } = await loadPreview(year)
  const known = preview
    ? preview.knownById + Object.values(preview.knownBySite).reduce((a, b) => a + (b ?? 0), 0)
    : 0

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-foreground font-serif text-2xl font-bold">Sites à récupérer</h1>
        <p className="text-muted-foreground max-w-3xl text-sm">
          Événements publiés sur l&apos;ancien site (pierresenlumieres.fr) qui manquent ici.
          L&apos;import crée des <strong className="text-foreground">brouillons</strong> à relire
          avant publication. Il ne modifie, ne dépublie et ne supprime aucun événement existant, et
          un site déjà présent n&apos;est jamais importé deux fois.
        </p>
      </div>

      {preview ? (
        <nav aria-label="Édition de l'ancien site" className="flex flex-wrap gap-2">
          {preview.years.map((value) => (
            <Link
              key={value}
              href={`/${locale}/admin/recovery?year=${value}`}
              aria-current={value === year ? "page" : undefined}
              className={cn(
                "focus-visible:ring-primary/50 inline-flex min-h-11 items-center rounded-md border px-4 text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none",
                value === year
                  ? "border-amber-500/60 bg-amber-500/15 text-amber-300"
                  : "text-muted-foreground hover:text-foreground border-white/10 bg-white/5"
              )}
            >
              {value}
            </Link>
          ))}
        </nav>
      ) : null}

      {error ? (
        <p role="alert" className="rounded-md border border-red-500/40 bg-red-500/10 p-4 text-sm">
          Impossible de lire l&apos;ancien site : {error}
        </p>
      ) : null}

      {preview ? (
        <>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <dt className="text-muted-foreground text-sm">Publiés sur l&apos;ancien site</dt>
              <dd className="text-foreground text-2xl font-semibold">{preview.total}</dd>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <dt className="text-muted-foreground text-sm">Déjà présents ici</dt>
              <dd className="text-foreground text-2xl font-semibold">{known}</dd>
            </div>
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
              <dt className="text-sm text-amber-200">À récupérer</dt>
              <dd data-testid="recovery-missing" className="text-2xl font-semibold text-amber-300">
                {preview.planned.length}
              </dd>
            </div>
          </dl>
          <RecoveryForm key={year} year={year} planned={preview.planned} />
        </>
      ) : null}
    </div>
  )
}

export default AdminRecoveryRoute
