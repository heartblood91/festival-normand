import { getFormatter, getTranslations } from "next-intl/server"
import { Marker } from "@/components/editorial/primitives"
import { RatingStars } from "@/components/event-detail/rating-stars"
import { ReviewForm } from "@/components/event-detail/review-form"
import type { EventReviewSummary } from "@/lib/queries/reviews"

type EventReviewsProps = {
  slug: string
  locale: string
  summary: EventReviewSummary
  /** Visitors can only review a site once it has opened. */
  open: boolean
}

export const EventReviews = async ({ slug, locale, summary, open }: EventReviewsProps) => {
  if (!open && summary.count === 0) return null
  const t = await getTranslations("reviews")
  const format = await getFormatter()
  const average = summary.average === null ? null : Math.round(summary.average * 10) / 10

  return (
    <section aria-labelledby="reviews-title" className="mt-16">
      <Marker className="mb-3">{t("marker")}</Marker>
      <h2
        id="reviews-title"
        className="text-foreground font-display text-3xl font-normal tracking-tight italic md:text-4xl"
      >
        {t("title")}
      </h2>

      {average !== null ? (
        <p className="text-ed-bone mt-4 flex flex-wrap items-center gap-3 font-serif text-lg">
          <RatingStars
            value={Math.round(average * 2) / 2}
            label={t("average", { value: format.number(average) })}
          />
          <span aria-hidden="true">{format.number(average)} / 5</span>
          <span className="text-ed-mute font-sans text-sm">
            {t("count", { count: summary.count })}
          </span>
        </p>
      ) : (
        <p className="text-ed-bone mt-4 font-serif text-lg">{t("empty")}</p>
      )}

      {summary.reviews.length > 0 ? (
        <ul className="mt-8 space-y-4">
          {summary.reviews.map((review) => (
            <li key={review.id} className="border-primary/20 bg-ed-bg-deep border p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <RatingStars value={review.rating} label={t("rating", { value: review.rating })} />
                <p className="text-foreground font-sans text-sm font-semibold">
                  {review.authorName}
                </p>
                <p className="text-ed-mute font-sans text-xs">
                  <time dateTime={review.createdAt}>
                    {format.dateTime(new Date(review.createdAt), {
                      dateStyle: "long",
                      timeZone: "Europe/Paris",
                    })}
                  </time>
                </p>
              </div>
              <p
                lang={review.locale === locale ? undefined : review.locale}
                className="text-ed-bone mt-3 font-serif text-base leading-relaxed break-words whitespace-pre-line"
              >
                {review.comment}
              </p>
            </li>
          ))}
        </ul>
      ) : null}

      {open ? <ReviewForm slug={slug} locale={locale} /> : null}
    </section>
  )
}
