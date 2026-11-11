"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { Send } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { submitSurveyResponse, type SurveySubmitResult } from "@/lib/actions/survey-submit"
import { RATING_VALUES, MAX_TEXT_ANSWER } from "@/lib/schemas/survey"
import type { PublicSurvey, PublicSurveyQuestion } from "@/lib/queries/surveys"
import { cn } from "@/lib/utils"

type SurveyFormProps = {
  survey: PublicSurvey
  locale: string
}

const legendClass = "text-foreground font-display text-xl leading-snug font-normal italic"
const choiceClass =
  "border-primary/30 bg-ed-bg-soft has-[:checked]:border-primary has-[:checked]:bg-primary/15 has-[:focus-visible]:ring-primary/50 flex min-h-11 cursor-pointer items-center gap-3 border px-4 py-2.5 font-serif text-base transition-colors has-[:focus-visible]:ring-2"

const fieldName = (question: PublicSurveyQuestion) => `q_${question.id}`

export const SurveyForm = ({ survey, locale }: SurveyFormProps) => {
  const t = useTranslations("survey")
  const [state, setState] = useState<SurveySubmitResult>({ status: "idle" })
  const [isPending, startTransition] = useTransition()
  const feedbackRef = useRef<HTMLDivElement>(null)
  const thanksRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (state.status === "sent") thanksRef.current?.focus()
    else if (state.status !== "idle") feedbackRef.current?.focus()
  }, [state])

  // Submitting by hand keeps the answers in place when the server asks for a fix.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      setState(await submitSurveyResponse(survey.slug, locale, { status: "idle" }, formData))
    })
  }

  if (state.status === "sent") {
    return (
      <div className="border-primary/40 bg-primary/5 border p-8 text-center">
        <h2 ref={thanksRef} tabIndex={-1} className={cn(legendClass, "text-3xl outline-none")}>
          {t("sentTitle")}
        </h2>
        <p className="text-ed-bone mt-4 font-serif text-lg">{t("sentBody")}</p>
        <Link
          href="/"
          className="text-primary hover:text-ed-amber-soft focus-visible:ring-primary/50 mt-6 inline-flex min-h-11 items-center font-sans font-semibold underline underline-offset-4 focus-visible:ring-2 focus-visible:outline-none"
        >
          {t("backHome")}
        </Link>
      </div>
    )
  }

  const errors = state.errors ?? {}
  const feedback =
    state.status === "invalid"
      ? Object.keys(errors).length
        ? t("errorSummary")
        : t("errorEmpty")
      : state.status === "limited"
        ? t("errorLimited")
        : state.status === "error"
          ? t("errorServer")
          : null

  const errorText = (question: PublicSurveyQuestion) =>
    errors[question.id] === "required"
      ? t("errorRequired")
      : errors[question.id]
        ? t("errorInvalid")
        : null

  return (
    <form onSubmit={handleSubmit} className="space-y-10" noValidate>
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="survey-website">Ne pas remplir</label>
        <input type="text" id="survey-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <p className="text-ed-bone font-serif text-base">{t("requiredHint")}</p>

      {feedback && (
        <div
          ref={feedbackRef}
          tabIndex={-1}
          role="alert"
          className="border border-red-400/60 bg-red-500/10 p-4 font-serif text-base text-red-200 outline-none"
        >
          {feedback}
        </div>
      )}

      {survey.questions.map((question, index) => {
        const error = errorText(question)
        const errorId = `${question.id}-error`
        const label = (
          <>
            <span className="text-primary mr-2 font-mono text-sm not-italic">{index + 1}.</span>
            {question.label}
            {question.required && (
              <>
                {" "}
                <span className="text-primary" aria-hidden="true">
                  *
                </span>
                <span className="sr-only">({t("required")})</span>
              </>
            )}
          </>
        )
        const errorNode = error && (
          <p id={errorId} className="mt-2 font-sans text-sm text-red-400">
            {error}
          </p>
        )

        if (question.type === "text") {
          return (
            <div key={question.id}>
              <label htmlFor={fieldName(question)} className={cn(legendClass, "mb-4 block")}>
                {label}
              </label>
              <textarea
                id={fieldName(question)}
                name={fieldName(question)}
                rows={4}
                maxLength={MAX_TEXT_ANSWER}
                placeholder={t("textPlaceholder")}
                aria-invalid={error ? true : undefined}
                aria-describedby={error ? errorId : undefined}
                className="border-primary/30 bg-ed-bg-soft text-foreground placeholder:text-ed-mute focus-visible:border-primary focus-visible:ring-primary/30 w-full resize-y border px-4 py-3 font-serif text-base focus-visible:ring-2 focus-visible:outline-none"
              />
              {errorNode}
            </div>
          )
        }

        const isRating = question.type === "rating"
        const isMultiple = question.type === "multiple"
        return (
          <fieldset
            key={question.id}
            aria-invalid={error ? true : undefined}
            aria-describedby={
              [(isRating || isMultiple) && `${question.id}-scale`, error && errorId]
                .filter(Boolean)
                .join(" ") || undefined
            }
          >
            <legend className={cn(legendClass, "mb-4")}>{label}</legend>
            {(isRating || isMultiple) && (
              <p id={`${question.id}-scale`} className="text-ed-bone -mt-2 mb-3 font-sans text-sm">
                {isRating ? t("ratingLegend") : t("printMultiple")}
              </p>
            )}
            <div className={isRating ? "flex flex-wrap gap-2" : "grid gap-2 md:grid-cols-2"}>
              {isRating
                ? RATING_VALUES.map((value) => (
                    <label key={value} className={cn(choiceClass, "min-w-14 justify-center")}>
                      <input
                        type="radio"
                        name={fieldName(question)}
                        value={value}
                        className="sr-only"
                      />
                      <span aria-hidden="true" className="text-lg">
                        {value}
                      </span>
                      <span className="sr-only">{t("ratingValue", { value })}</span>
                    </label>
                  ))
                : question.options.map((option) => (
                    <label key={option.id} className={choiceClass}>
                      <input
                        type={isMultiple ? "checkbox" : "radio"}
                        name={fieldName(question)}
                        value={option.id}
                        className="accent-primary size-5 shrink-0"
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
            </div>
            {errorNode}
          </fieldset>
        )
      })}

      <button
        type="submit"
        disabled={isPending}
        className="bg-primary text-primary-foreground hover:bg-ed-amber-deep focus-visible:ring-ring inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 px-6 py-4 font-sans text-xs font-semibold tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-50 md:w-auto"
      >
        {isPending ? (
          t("sending")
        ) : (
          <>
            <Send className="size-4" aria-hidden="true" />
            {t("send")}
          </>
        )}
      </button>
    </form>
  )
}
