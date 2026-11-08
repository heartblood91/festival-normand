"use client"

import { CheckCircle2, AlertCircle, CircleDashed } from "lucide-react"

type ConfirmationStepProps = {
  contentType: string
  title: string
  locale: string
  /** False when no AI key is configured: nothing was actually checked. */
  aiChecked: boolean
  seoIssues: number
  a11yIssues: number
  spellingAccepted: number
  spellingRemaining: number
  translationApplied: boolean
}

type RowState = "ok" | "warning" | "unchecked"

const ROW_STYLES: Record<RowState, { box: string; icon: string; Icon: typeof CheckCircle2 }> = {
  ok: { box: "border-green-500/20 bg-green-500/10", icon: "text-green-400", Icon: CheckCircle2 },
  warning: {
    box: "border-amber-500/20 bg-amber-500/10",
    icon: "text-amber-400",
    Icon: AlertCircle,
  },
  unchecked: {
    box: "border-white/10 bg-white/5",
    icon: "text-muted-foreground",
    Icon: CircleDashed,
  },
}

const SummaryRow = ({
  state,
  label,
  detail,
}: {
  state: RowState
  label: string
  detail: string
}) => {
  const { box, icon, Icon } = ROW_STYLES[state]
  return (
    <li className={`flex items-start gap-3 rounded-lg border p-3 ${box}`}>
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${icon}`} aria-hidden="true" />
      <div>
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-muted-foreground text-xs">{detail}</p>
      </div>
    </li>
  )
}

const CONTENT_TYPES: Record<string, string> = {
  event: "Événement",
  news: "Actualité",
  page: "Page",
}

export const ConfirmationStep = ({
  contentType,
  title,
  locale,
  aiChecked,
  seoIssues,
  a11yIssues,
  spellingAccepted,
  spellingRemaining,
  translationApplied,
}: ConfirmationStepProps) => {
  const issueRow = (count: number, okDetail: string): { state: RowState; detail: string } =>
    !aiChecked
      ? { state: "unchecked", detail: "Non vérifié" }
      : count === 0
        ? { state: "ok", detail: okDetail }
        : { state: "warning", detail: `${count} point(s) à revoir` }

  const seo = issueRow(seoIssues, "Aucun point bloquant")
  const a11y = issueRow(a11yIssues, "Aucun point bloquant")
  const spelling: { state: RowState; detail: string } = !aiChecked
    ? { state: "unchecked", detail: "Non vérifié" }
    : {
        state: spellingRemaining === 0 ? "ok" : "warning",
        detail: `${spellingAccepted} correction(s) appliquée(s), ${spellingRemaining} ignorée(s)`,
      }
  const allClear = aiChecked && seoIssues === 0 && a11yIssues === 0 && spellingRemaining === 0

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-2 font-semibold text-white">Prêt à publier</h3>
        <p className="text-muted-foreground text-sm">
          Vérifiez le résumé puis confirmez la publication.
        </p>
      </div>

      <dl className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-4">
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground text-sm">Type</dt>
          <dd className="text-sm font-medium text-white">
            {CONTENT_TYPES[contentType] ?? contentType}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground text-sm">Titre</dt>
          <dd className="max-w-xs text-right text-sm font-medium break-words text-white">
            {title}
          </dd>
        </div>
        <div className="flex items-start justify-between gap-4">
          <dt className="text-muted-foreground text-sm">Langue</dt>
          <dd className="text-sm font-medium text-white uppercase">{locale}</dd>
        </div>
      </dl>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-white">Résumé des vérifications</h4>
        <ul className="grid gap-2">
          <SummaryRow label="SEO" {...seo} />
          <SummaryRow label="Accessibilité (RGAA)" {...a11y} />
          <SummaryRow label="Orthographe" {...spelling} />
          {translationApplied && (
            <SummaryRow state="ok" label="Traduction" detail="Champs anglais vides pré-remplis" />
          )}
        </ul>
      </div>

      <p
        className={`rounded-lg border p-4 text-sm ${
          allClear
            ? "border-green-500/20 bg-green-500/10 text-green-300"
            : "border-amber-500/20 bg-amber-500/10 text-amber-300"
        }`}
      >
        {allClear
          ? "Tout est en ordre : le contenu peut être publié."
          : "Vous pouvez publier, mais relisez d'abord les points signalés ou non vérifiés."}
      </p>
    </div>
  )
}
