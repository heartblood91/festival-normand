import { Link } from "@/lib/i18n/routing"
import { ArrowLeft, Download, ExternalLink, Pencil, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RATING_VALUES } from "@/lib/schemas/survey"
import type { SurveyResults as SurveyResultsData } from "@/lib/actions/surveys"
import type { QuestionSummary } from "@/lib/survey-results"

const percent = (count: number, total: number) => (total ? Math.round((count / total) * 100) : 0)

const Bar = ({ label, count, total }: { label: string; count: number; total: number }) => (
  <li>
    <div className="flex justify-between gap-3 text-sm">
      <span className="text-white">{label}</span>
      <span className="text-muted-foreground shrink-0 tabular-nums">
        {count} · {percent(count, total)} %
      </span>
    </div>
    <div className="mt-1 h-2 rounded-full bg-white/10" aria-hidden="true">
      <div
        className="h-2 rounded-full bg-amber-500"
        style={{ width: `${percent(count, total)}%` }}
      />
    </div>
  </li>
)

const QuestionResult = ({ summary }: { summary: QuestionSummary }) => {
  const { question, answered } = summary
  return (
    <section className="rounded-xl border border-white/10 bg-white/5 p-5">
      <h2 className="font-medium text-white">{question.labelFr}</h2>
      <p className="text-muted-foreground mt-1 text-xs">
        {answered} réponse{answered > 1 ? "s" : ""}
        {summary.kind === "rating" && summary.average !== null && (
          <> · moyenne {summary.average.toFixed(1).replace(".", ",")} / 5</>
        )}
      </p>
      {summary.kind === "choice" && (
        <ul className="mt-4 space-y-3">
          {question.options.map((option) => (
            <Bar
              key={option.id}
              label={option.labelFr}
              count={summary.counts[option.id] ?? 0}
              total={answered}
            />
          ))}
        </ul>
      )}
      {summary.kind === "rating" && (
        <ul className="mt-4 space-y-3">
          {[...RATING_VALUES].reverse().map((value) => (
            <Bar
              key={value}
              label={`${value} / 5`}
              count={summary.counts[value] ?? 0}
              total={answered}
            />
          ))}
        </ul>
      )}
      {summary.kind === "text" &&
        (summary.texts.length ? (
          <ul className="mt-4 space-y-2">
            {summary.texts.map((text, index) => (
              <li
                key={index}
                className="border-l-2 border-amber-500/50 pl-3 text-sm whitespace-pre-line text-white/90"
              >
                {text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground mt-3 text-sm">Pas encore de réponse.</p>
        ))}
      {summary.kind === "text" && answered > summary.texts.length && (
        <p className="text-muted-foreground mt-3 text-xs">
          Les {summary.texts.length} dernières réponses ; toutes sont dans l&apos;export.
        </p>
      )}
    </section>
  )
}

export const SurveyResults = ({ results }: { results: SurveyResultsData }) => (
  <div className="mx-auto w-full max-w-4xl space-y-6">
    <Button asChild variant="ghost">
      <Link href="/admin/surveys">
        <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
        Retour
      </Link>
    </Button>
    <div>
      <h1 className="font-serif text-2xl font-bold text-amber-500">{results.titleFr}</h1>
      <p className="text-muted-foreground mt-1 text-sm">
        {results.total} réponse{results.total > 1 ? "s" : ""} ·{" "}
        {results.published ? "ouvert aux réponses" : "fermé"}
      </p>
    </div>
    <div className="flex flex-wrap gap-2">
      <Button asChild className="min-h-11">
        <a href={`/api/admin/surveys/${results.id}/export`} download>
          <Download className="mr-2 h-4 w-4" aria-hidden="true" />
          Exporter les réponses (CSV)
        </a>
      </Button>
      {results.published && (
        <>
          <Button asChild variant="outline" className="min-h-11">
            <a href={`/fr/questionnaire/${results.slug}`} target="_blank">
              <ExternalLink className="mr-2 h-4 w-4" aria-hidden="true" />
              Voir en ligne
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </Button>
          <Button asChild variant="outline" className="min-h-11">
            <a href={`/fr/questionnaire/${results.slug}/imprimer`} target="_blank">
              <Printer className="mr-2 h-4 w-4" aria-hidden="true" />
              Version imprimable
              <span className="sr-only"> (nouvel onglet)</span>
            </a>
          </Button>
        </>
      )}
      <Button asChild variant="ghost" className="min-h-11">
        <Link href={`/admin/surveys/${results.id}/edit`}>
          <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
          Modifier
        </Link>
      </Button>
    </div>
    {results.summaries.map((summary) => (
      <QuestionResult key={summary.question.id} summary={summary} />
    ))}
  </div>
)
