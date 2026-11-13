"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Link } from "@/lib/i18n/routing"
import { ArrowDown, ArrowLeft, ArrowUp, Loader2, Plus, Trash2, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { saveSurvey, type AdminSurvey } from "@/lib/actions/surveys"
import { slugify } from "@/lib/schemas/event"
import {
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
  type QuestionType,
  type SurveyQuestion,
} from "@/lib/schemas/survey"

type SurveyFormProps = {
  survey?: AdminSurvey
}

type DraftOption = { id: string; labelFr: string; labelEn: string }
type DraftQuestion = Omit<SurveyQuestion, "labelEn" | "options"> & {
  labelEn: string
  options: DraftOption[]
}

const FIELD_CLASS = "mt-1 border-white/10 bg-white/5 text-white"

// Stable ids keep stored answers attached when questions are reordered or relabelled.
const newId = () => crypto.randomUUID().slice(0, 8)

const newOption = (): DraftOption => ({ id: newId(), labelFr: "", labelEn: "" })

const newQuestion = (type: QuestionType = "single"): DraftQuestion => ({
  id: newId(),
  type,
  labelFr: "",
  labelEn: "",
  required: false,
  options: type === "single" || type === "multiple" ? [newOption(), newOption()] : [],
})

const toDraft = (question: SurveyQuestion): DraftQuestion => ({
  ...question,
  labelEn: question.labelEn ?? "",
  options: question.options.map((option) => ({ ...option, labelEn: option.labelEn ?? "" })),
})

const isChoice = (type: QuestionType) => type === "single" || type === "multiple"

const FieldError = ({ id, messages }: { id: string; messages?: string[] }) =>
  messages?.length ? (
    <p id={`${id}-error`} className="mt-1 text-sm text-red-400">
      {messages[0]}
    </p>
  ) : null

export const SurveyForm = ({ survey }: SurveyFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [titleFr, setTitleFr] = useState(survey?.titleFr ?? "")
  const [slug, setSlug] = useState(survey?.slug ?? "")
  const [slugEdited, setSlugEdited] = useState(Boolean(survey))
  const [published, setPublished] = useState(survey?.published ?? false)
  const [questions, setQuestions] = useState<DraftQuestion[]>(
    survey?.questions.length ? survey.questions.map(toDraft) : [newQuestion()]
  )

  const describedBy = (field: string) => (errors[field] ? `${field}-error` : undefined)

  const updateQuestion = (id: string, patch: Partial<DraftQuestion>) =>
    setQuestions((list) =>
      list.map((question) => (question.id === id ? { ...question, ...patch } : question))
    )

  const changeType = (question: DraftQuestion, type: QuestionType) =>
    updateQuestion(question.id, {
      type,
      options:
        isChoice(type) && question.options.length < 2
          ? [...question.options, ...Array.from({ length: 2 - question.options.length }, newOption)]
          : question.options,
    })

  const updateOption = (question: DraftQuestion, optionId: string, patch: Partial<DraftOption>) =>
    updateQuestion(question.id, {
      options: question.options.map((option) =>
        option.id === optionId ? { ...option, ...patch } : option
      ),
    })

  const moveQuestion = (index: number, offset: -1 | 1) =>
    setQuestions((list) => {
      const next = [...list]
      const [moved] = next.splice(index, 1)
      next.splice(index + offset, 0, moved)
      return next
    })

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setIsSubmitting(true)
    setErrors({})
    const result = await saveSurvey(survey?.id ?? null, {
      titleFr,
      titleEn: (formData.get("titleEn") as string) ?? "",
      slug,
      introFr: (formData.get("introFr") as string) ?? "",
      introEn: (formData.get("introEn") as string) ?? "",
      published,
      questions,
    })
    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push("/admin/surveys")
      router.refresh()
      return
    }
    toast.error(result.message)
    if (result.errors) setErrors(result.errors)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Button asChild variant="ghost">
        <Link href="/admin/surveys">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Retour
        </Link>
      </Button>

      {survey && survey._count.responses > 0 && (
        <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          Ce questionnaire a déjà {survey._count.responses} réponse
          {survey._count.responses > 1 ? "s" : ""}. Corriger un intitulé ou ajouter une question est
          sans risque ; supprimer une question ou un choix retire ses réponses de l&apos;export.
        </p>
      )}

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Français</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="titleFr" className="text-muted-foreground">
              Titre *
            </Label>
            <Input
              id="titleFr"
              value={titleFr}
              onChange={(e) => {
                setTitleFr(e.target.value)
                if (!slugEdited) setSlug(slugify(e.target.value))
              }}
              required
              className={FIELD_CLASS}
              aria-invalid={!!errors.titleFr}
              aria-describedby={describedBy("titleFr")}
            />
            <FieldError id="titleFr" messages={errors.titleFr} />
          </div>
          <div>
            <Label htmlFor="introFr" className="text-muted-foreground">
              Introduction
            </Label>
            <Textarea
              id="introFr"
              name="introFr"
              defaultValue={survey?.introFr ?? ""}
              rows={3}
              className={FIELD_CLASS}
              aria-invalid={!!errors.introFr}
              aria-describedby={describedBy("introFr")}
            />
            <FieldError id="introFr" messages={errors.introFr} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5" lang="en">
        <CardHeader>
          <CardTitle className="text-white">English</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="titleEn" className="text-muted-foreground">
              Title
            </Label>
            <Input
              id="titleEn"
              name="titleEn"
              defaultValue={survey?.titleEn ?? ""}
              className={FIELD_CLASS}
            />
          </div>
          <div>
            <Label htmlFor="introEn" className="text-muted-foreground">
              Introduction
            </Label>
            <Textarea
              id="introEn"
              name="introEn"
              defaultValue={survey?.introEn ?? ""}
              rows={3}
              className={FIELD_CLASS}
            />
          </div>
          <p className="text-muted-foreground text-xs">
            Without English text, visitors browsing in English see the French version.
          </p>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {errors.questions?.length ? (
            <ul id="questions-error" className="list-disc space-y-1 pl-5 text-sm text-red-400">
              {[...new Set(errors.questions)].map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}
          <ol className="space-y-4">
            {questions.map((question, index) => (
              <li key={question.id}>
                <fieldset className="rounded-lg border border-white/10 p-4">
                  <legend className="px-1 text-sm font-semibold text-amber-400">
                    Question {index + 1}
                  </legend>
                  <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
                    <div>
                      <Label htmlFor={`${question.id}-labelFr`} className="text-muted-foreground">
                        Intitulé *
                      </Label>
                      <Input
                        id={`${question.id}-labelFr`}
                        value={question.labelFr}
                        onChange={(e) => updateQuestion(question.id, { labelFr: e.target.value })}
                        className={FIELD_CLASS}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${question.id}-type`} className="text-muted-foreground">
                        Type de réponse
                      </Label>
                      <select
                        id={`${question.id}-type`}
                        value={question.type}
                        onChange={(e) => changeType(question, e.target.value as QuestionType)}
                        className="mt-1 block h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-white"
                      >
                        {QUESTION_TYPES.map((type) => (
                          <option key={type} value={type} className="bg-slate-900">
                            {QUESTION_TYPE_LABELS[type]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mt-3" lang="en">
                    <Label htmlFor={`${question.id}-labelEn`} className="text-muted-foreground">
                      Question (English)
                    </Label>
                    <Input
                      id={`${question.id}-labelEn`}
                      value={question.labelEn}
                      onChange={(e) => updateQuestion(question.id, { labelEn: e.target.value })}
                      className={FIELD_CLASS}
                    />
                  </div>

                  {isChoice(question.type) && (
                    <div className="mt-4">
                      <p className="text-muted-foreground mb-2 text-sm font-medium">Choix</p>
                      <ul className="space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <li
                            key={option.id}
                            className="grid grid-cols-[1fr_auto] gap-2 md:grid-cols-[1fr_1fr_auto]"
                          >
                            <Input
                              value={option.labelFr}
                              onChange={(e) =>
                                updateOption(question, option.id, { labelFr: e.target.value })
                              }
                              aria-label={`Question ${index + 1}, choix ${optionIndex + 1}`}
                              placeholder={`Choix ${optionIndex + 1}`}
                              className="h-11 border-white/10 bg-white/5 text-white"
                            />
                            <Input
                              lang="en"
                              value={option.labelEn}
                              onChange={(e) =>
                                updateOption(question, option.id, { labelEn: e.target.value })
                              }
                              aria-label={`Question ${index + 1}, choice ${optionIndex + 1} (English)`}
                              placeholder="English"
                              className="col-start-1 h-11 border-white/10 bg-white/5 text-white md:col-start-auto"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="row-span-2 size-11 self-start text-red-400 md:row-span-1"
                              disabled={question.options.length <= 2}
                              onClick={() =>
                                updateQuestion(question.id, {
                                  options: question.options.filter(({ id }) => id !== option.id),
                                })
                              }
                              aria-label={`Retirer le choix ${optionIndex + 1} de la question ${index + 1}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </li>
                        ))}
                      </ul>
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 min-h-11"
                        disabled={question.options.length >= 20}
                        onClick={() =>
                          updateQuestion(question.id, {
                            options: [...question.options, newOption()],
                          })
                        }
                      >
                        <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                        Ajouter un choix
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex min-h-11 cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={question.required}
                        onChange={(e) =>
                          updateQuestion(question.id, { required: e.target.checked })
                        }
                        className="size-5 accent-amber-500"
                      />
                      <span className="text-sm text-white">Réponse obligatoire</span>
                    </label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11"
                        disabled={index === 0}
                        onClick={() => moveQuestion(index, -1)}
                        aria-label={`Monter la question ${index + 1}`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11"
                        disabled={index === questions.length - 1}
                        onClick={() => moveQuestion(index, 1)}
                        aria-label={`Descendre la question ${index + 1}`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-11 text-red-400 hover:text-red-300"
                        disabled={questions.length <= 1}
                        onClick={() =>
                          setQuestions((list) => list.filter(({ id }) => id !== question.id))
                        }
                        aria-label={`Supprimer la question ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </fieldset>
              </li>
            ))}
          </ol>
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={questions.length >= 40}
            onClick={() => setQuestions((list) => [...list, newQuestion()])}
          >
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Ajouter une question
          </Button>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Diffusion</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="slug" className="text-muted-foreground">
              Slug (adresse du questionnaire) *
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugEdited(true)
              }}
              required
              className={FIELD_CLASS}
              aria-invalid={!!errors.slug}
              aria-describedby={["slug-hint", describedBy("slug")].filter(Boolean).join(" ")}
            />
            <p id="slug-hint" className="text-muted-foreground mt-1 text-xs">
              /fr/questionnaire/{slug || "…"}
            </p>
            <FieldError id="slug" messages={errors.slug} />
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 p-3">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="size-5 accent-amber-500"
            />
            <span>
              <span className="block font-medium text-white">Ouvert aux réponses</span>
              <span className="text-muted-foreground block text-sm">
                Le questionnaire et sa version imprimable sont accessibles par leur adresse et leur
                QR code. Décoché, il n&apos;est plus visible et n&apos;accepte plus de réponse.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button asChild variant="ghost">
          <Link href="/admin/surveys">Annuler</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {survey ? "Mettre à jour" : "Créer le questionnaire"}
        </Button>
      </div>
    </form>
  )
}
