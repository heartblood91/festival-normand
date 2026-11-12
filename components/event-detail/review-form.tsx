"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useTranslations } from "next-intl"
import { Send } from "lucide-react"
import { submitEventReview, type ReviewSubmitResult } from "@/lib/actions/review-submit"
import {
  REVIEW_COMMENT_MAX,
  REVIEW_COMMENT_MIN,
  REVIEW_NAME_MAX,
  REVIEW_RATINGS,
  type ReviewField,
} from "@/lib/schemas/review"
import { cn } from "@/lib/utils"

type ReviewFormProps = {
  slug: string
  locale: string
}

const labelClass = "text-foreground mb-2 block font-sans text-sm font-semibold"
const inputClass =
  "border-primary/30 bg-ed-bg-soft text-foreground placeholder:text-ed-mute focus-visible:border-primary focus-visible:ring-primary/30 w-full border px-4 py-3 font-serif text-base focus-visible:ring-2 focus-visible:outline-none"
const choiceClass =
  "border-primary/30 bg-ed-bg-soft has-[:checked]:border-primary has-[:checked]:bg-primary/15 has-[:focus-visible]:ring-primary/50 flex min-h-11 min-w-14 cursor-pointer items-center justify-center border px-4 py-2.5 font-serif text-lg transition-colors has-[:focus-visible]:ring-2"

export const ReviewForm = ({ slug, locale }: ReviewFormProps) => {
  const t = useTranslations("reviews")
  const [state, setState] = useState<ReviewSubmitResult>({ status: "idle" })
  const [isPending, startTransition] = useTransition()
  const feedbackRef = useRef<HTMLDivElement>(null)
  const thanksRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (state.status === "sent") thanksRef.current?.focus()
    else if (state.status !== "idle") feedbackRef.current?.focus()
  }, [state])

  // Submitting by hand keeps the text in place when the server asks for a fix.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      setState(await submitEventReview(slug, locale, { status: "idle" }, formData))
    })
  }

  if (state.status === "sent") {
    return (
      <div className="border-primary/40 bg-primary/5 mt-10 border p-6">
        <p
          ref={thanksRef}
          tabIndex={-1}
          className="text-foreground font-display text-2xl italic outline-none"
        >
          {t("sentTitle")}
        </p>
        <p className="text-ed-bone mt-2 font-serif text-base">{t("sentBody")}</p>
      </div>
    )
  }

  const errors = state.errors ?? {}
  const feedback =
    state.status === "invalid"
      ? t("errorSummary")
      : state.status === "limited"
        ? t("errorLimited")
        : state.status === "closed"
          ? t("errorClosed")
          : state.status === "error"
            ? t("errorServer")
            : null

  const errorId = (field: ReviewField) => `review-${field}-error`
  const errorNode = (field: ReviewField) =>
    errors[field] ? (
      <p id={errorId(field)} className="mt-2 font-sans text-sm text-red-400">
        {t(`error.${errors[field]}`, {
          min: REVIEW_COMMENT_MIN,
          max: field === "authorName" ? REVIEW_NAME_MAX : REVIEW_COMMENT_MAX,
        })}
      </p>
    ) : null
  const describedBy = (field: ReviewField, hint?: string) =>
    [hint, errors[field] && errorId(field)].filter(Boolean).join(" ") || undefined

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-labelledby="review-form-title"
      className="border-primary/25 bg-ed-bg-deep mt-10 space-y-6 border p-5 md:p-6"
    >
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="review-website">Ne pas remplir</label>
        <input type="text" id="review-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div>
        <h3 id="review-form-title" className="text-foreground font-display text-2xl italic">
          {t("formTitle")}
        </h3>
        <p className="text-ed-bone mt-2 font-serif text-base">{t("formIntro")}</p>
      </div>

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

      <fieldset
        aria-invalid={errors.rating ? true : undefined}
        aria-describedby={describedBy("rating")}
      >
        <legend className={labelClass}>
          {t("ratingLabel")}{" "}
          <span className="text-primary" aria-hidden="true">
            *
          </span>
          <span className="sr-only">({t("required")})</span>
        </legend>
        <div className="flex flex-wrap gap-2">
          {REVIEW_RATINGS.map((value) => (
            <label key={value} className={choiceClass}>
              <input type="radio" name="rating" value={value} className="sr-only" />
              <span aria-hidden="true">{value}</span>
              <span className="sr-only">{t("rating", { value })}</span>
            </label>
          ))}
        </div>
        {errorNode("rating")}
      </fieldset>

      <div>
        <label htmlFor="review-comment" className={labelClass}>
          {t("commentLabel")}{" "}
          <span className="text-primary" aria-hidden="true">
            *
          </span>
          <span className="sr-only">({t("required")})</span>
        </label>
        <textarea
          id="review-comment"
          name="comment"
          rows={5}
          maxLength={REVIEW_COMMENT_MAX}
          aria-invalid={errors.comment ? true : undefined}
          aria-describedby={describedBy("comment", "review-comment-hint")}
          className={cn(inputClass, "resize-y")}
        />
        <p id="review-comment-hint" className="text-ed-mute mt-1 font-sans text-xs">
          {t("commentHint", { min: REVIEW_COMMENT_MIN, max: REVIEW_COMMENT_MAX })}
        </p>
        {errorNode("comment")}
      </div>

      <div>
        <label htmlFor="review-name" className={labelClass}>
          {t("nameLabel")}{" "}
          <span className="text-primary" aria-hidden="true">
            *
          </span>
          <span className="sr-only">({t("required")})</span>
        </label>
        <input
          id="review-name"
          name="authorName"
          type="text"
          maxLength={REVIEW_NAME_MAX}
          autoComplete="given-name"
          aria-invalid={errors.authorName ? true : undefined}
          aria-describedby={describedBy("authorName", "review-name-hint")}
          className={cn(inputClass, "md:max-w-sm")}
        />
        <p id="review-name-hint" className="text-ed-mute mt-1 font-sans text-xs">
          {t("nameHint")}
        </p>
        {errorNode("authorName")}
      </div>

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
