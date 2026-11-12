"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Link } from "@/lib/i18n/routing"
import { Bot, Check, ExternalLink, RotateCcw, Sparkles, Star, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  deleteReview,
  requestReviewAdvice,
  setReviewStatus,
  type AdminReview,
  type AdminReviews,
  type ReviewActionResult,
  type ReviewFilter,
} from "@/lib/actions/reviews"
import { cn } from "@/lib/utils"

type AdminReviewsPageProps = AdminReviews & {
  status: ReviewFilter
}

const TABS: { status: ReviewFilter; label: string }[] = [
  { status: "PENDING", label: "À valider" },
  { status: "APPROVED", label: "Publiés" },
  { status: "REJECTED", label: "Refusés" },
]

const EMPTY: Record<ReviewFilter, string> = {
  PENDING: "Aucun avis en attente : tout est à jour.",
  APPROVED: "Aucun avis publié pour le moment.",
  REJECTED: "Aucun avis refusé.",
}

const dateFormat = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Paris",
})

const AiAdvice = ({ review, aiConfigured }: { review: AdminReview; aiConfigured: boolean }) => {
  if (!review.aiVerdict) {
    return (
      <p className="text-muted-foreground flex items-center gap-2 text-xs">
        <Bot className="size-4 shrink-0" aria-hidden="true" />
        {aiConfigured ? "Pas encore d'avis de l'IA." : "IA non configurée : relecture manuelle."}
      </p>
    )
  }
  const approve = review.aiVerdict === "approve"
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
        approve
          ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
          : "border-red-400/40 bg-red-500/10 text-red-200"
      )}
    >
      <Bot className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
      <span>
        <strong>IA : {approve ? "à publier" : "à refuser"}</strong>
        {review.aiReason ? <> — {review.aiReason}</> : null}
      </span>
    </p>
  )
}

export const AdminReviewsPage = ({
  status,
  reviews,
  totals,
  aiConfigured,
}: AdminReviewsPageProps) => {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)

  const run = async (id: string, action: () => Promise<ReviewActionResult>) => {
    setBusyId(id)
    const result = await action()
    setBusyId(null)
    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-amber-500">Avis visiteurs</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Les avis laissés sur les fiches des sites. L&apos;IA donne une recommandation, mais aucun
          avis n&apos;est publié sans votre validation.
        </p>
      </div>

      <nav aria-label="Statut des avis" className="mb-6">
        <ul className="flex flex-wrap gap-2">
          {TABS.map((tab) => {
            const current = tab.status === status
            return (
              <li key={tab.status}>
                <Link
                  href={
                    tab.status === "PENDING"
                      ? "/admin/reviews"
                      : `/admin/reviews?statut=${tab.status.toLowerCase()}`
                  }
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:outline-none",
                    current
                      ? "border-amber-500 bg-amber-500/15 text-amber-300"
                      : "border-white/10 bg-white/5 text-white hover:border-white/30"
                  )}
                >
                  {tab.label}
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs">
                    {totals[tab.status]}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {reviews.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-muted-foreground">{EMPTY[status]}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {reviews.map((review) => {
            const busy = busyId === review.id
            const label = `l'avis de ${review.authorName} sur ${review.event.titleFr}`
            return (
              <li key={review.id}>
                <article
                  aria-label={`Avis de ${review.authorName}`}
                  className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between md:gap-4">
                    <div className="min-w-0">
                      <p className="font-medium break-words text-white">
                        {review.authorName}
                        <span className="text-muted-foreground font-normal">
                          {" "}
                          sur{" "}
                          <a
                            href={`/fr/evenement/${review.event.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-amber-300 underline-offset-4 hover:underline"
                          >
                            {review.event.titleFr}
                            <ExternalLink className="size-3" aria-hidden="true" />
                            <span className="sr-only"> (nouvel onglet)</span>
                          </a>
                        </span>
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {dateFormat.format(new Date(review.createdAt))}
                        {review.locale !== "fr" ? ` · ${review.locale.toUpperCase()}` : null}
                      </p>
                    </div>
                    <p className="flex items-center gap-1 text-amber-400">
                      <span className="sr-only">Note : </span>
                      <span className="flex" aria-hidden="true">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={cn("size-4", star <= review.rating && "fill-current")}
                          />
                        ))}
                      </span>
                      <span className="text-sm">{review.rating}/5</span>
                    </p>
                  </div>

                  <p className="text-sm leading-relaxed break-words whitespace-pre-line text-white/90">
                    {review.comment}
                  </p>

                  <AiAdvice review={review} aiConfigured={aiConfigured} />

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {review.status !== "APPROVED" && (
                      <Button
                        className="min-h-11"
                        disabled={busy}
                        onClick={() => run(review.id, () => setReviewStatus(review.id, "APPROVED"))}
                      >
                        <Check className="mr-2 size-4" aria-hidden="true" />
                        Publier<span className="sr-only"> {label}</span>
                      </Button>
                    )}
                    {review.status !== "REJECTED" && (
                      <Button
                        variant="outline"
                        className="min-h-11"
                        disabled={busy}
                        onClick={() => run(review.id, () => setReviewStatus(review.id, "REJECTED"))}
                      >
                        <X className="mr-2 size-4" aria-hidden="true" />
                        {review.status === "APPROVED" ? "Dépublier" : "Refuser"}
                        <span className="sr-only"> {label}</span>
                      </Button>
                    )}
                    {review.status !== "PENDING" && (
                      <Button
                        variant="ghost"
                        className="min-h-11"
                        disabled={busy}
                        onClick={() => run(review.id, () => setReviewStatus(review.id, "PENDING"))}
                      >
                        <RotateCcw className="mr-2 size-4" aria-hidden="true" />
                        Remettre en attente<span className="sr-only"> {label}</span>
                      </Button>
                    )}
                    {aiConfigured && review.status === "PENDING" && (
                      <Button
                        variant="ghost"
                        className="min-h-11"
                        disabled={busy}
                        onClick={() => run(review.id, () => requestReviewAdvice(review.id))}
                      >
                        <Sparkles className="mr-2 size-4" aria-hidden="true" />
                        {review.aiVerdict ? "Redemander l'avis de l'IA" : "Demander l'avis de l'IA"}
                        <span className="sr-only"> sur {label}</span>
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto size-11 text-red-400 hover:text-red-300"
                            aria-label={`Supprimer ${label}`}
                            disabled={busy}
                          />
                        }
                      >
                        <Trash2 className="size-4" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l&apos;avis</AlertDialogTitle>
                          <AlertDialogDescription>
                            L&apos;avis de {review.authorName} sera définitivement supprimé. Pour le
                            garder sans le publier, refusez-le plutôt.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction
                            variant="destructive"
                            onClick={() => run(review.id, () => deleteReview(review.id))}
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
