"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Link } from "@/lib/i18n/routing"
import { BarChart3, Pencil, Plus, Printer, Trash2 } from "lucide-react"
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
import { deleteSurvey, type AdminSurveyListItem } from "@/lib/actions/surveys"

type AdminSurveysPageProps = {
  surveys: AdminSurveyListItem[]
}

const responseCount = (count: number) => `${count} réponse${count > 1 ? "s" : ""}`

export const AdminSurveysPage = ({ surveys }: AdminSurveysPageProps) => {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const result = await deleteSurvey(id)
    setDeletingId(null)
    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-amber-500">Questionnaires</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Questionnaires de satisfaction pour les visiteurs : en ligne, ou imprimés avec un QR
            code. Les réponses sont anonymes.
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link href="/admin/surveys/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nouveau questionnaire
          </Link>
        </Button>
      </div>

      {surveys.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-muted-foreground">Aucun questionnaire pour le moment.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {surveys.map((survey) => (
            <li
              key={survey.id}
              className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium break-words text-white">{survey.titleFr}</p>
                <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 text-xs">
                  <span className={survey.published ? "text-emerald-300" : undefined}>
                    {survey.published ? "Ouvert aux réponses" : "Fermé"}
                  </span>
                  <span>{responseCount(survey._count.responses)}</span>
                  <span>/questionnaire/{survey.slug}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-1">
                <Button asChild variant="outline" className="min-h-11">
                  <Link href={`/admin/surveys/${survey.id}/results`}>
                    <BarChart3 className="mr-2 h-4 w-4" aria-hidden="true" />
                    Résultats
                    <span className="sr-only"> de {survey.titleFr}</span>
                  </Link>
                </Button>
                {survey.published && (
                  <Button
                    asChild
                    variant="ghost"
                    size="icon"
                    className="size-11"
                    aria-label={`Version imprimable de ${survey.titleFr} (nouvel onglet)`}
                  >
                    <a href={`/fr/questionnaire/${survey.slug}/imprimer`} target="_blank">
                      <Printer className="h-4 w-4" />
                    </a>
                  </Button>
                )}
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-11"
                  aria-label={`Modifier ${survey.titleFr}`}
                >
                  <Link href={`/admin/surveys/${survey.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-11 text-red-400 hover:text-red-300"
                        aria-label={`Supprimer ${survey.titleFr}`}
                      />
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer le questionnaire</AlertDialogTitle>
                      <AlertDialogDescription>
                        « {survey.titleFr} » et ses {responseCount(survey._count.responses)} seront
                        définitivement supprimés. Exportez les réponses avant si besoin.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => handleDelete(survey.id)}
                        disabled={deletingId === survey.id}
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
