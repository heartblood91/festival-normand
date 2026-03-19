"use client"

import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import { ArrowRight, Pause, Play } from "lucide-react"
import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { formatNewsDate } from "@/lib/utils/format-date"
import type { LatestNewsItem } from "@/lib/queries/homepage"

type NewsCarouselProps = {
  news: LatestNewsItem[]
}

const NewsCarousel = ({ news }: NewsCarouselProps) => {
  const t = useTranslations()
  const locale = useLocale()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [autoScroll, setAutoScroll] = useState(true)

  if (news.length === 0) return null

  return (
    <section className="py-16 md:py-24" aria-labelledby="news-heading">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
          <div>
            <h2
              id="news-heading"
              className="font-serif text-2xl font-bold text-foreground md:text-3xl lg:text-4xl"
            >
              {t("newsSection.title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              {t("newsSection.subtitle")}
            </p>
          </div>
          <div className="hidden items-center gap-2 sm:inline-flex">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAutoScroll(!autoScroll)}
              aria-label={autoScroll ? t("a11y.pauseCarousel") : t("a11y.playCarousel")}
              className="text-primary hover:text-primary/80"
            >
              {autoScroll ? <Pause className="size-4" /> : <Play className="size-4" />}
            </Button>
            <Button asChild variant="ghost" className="inline-flex items-center gap-1 text-primary" aria-label={t("newsSection.viewAllLabel")}>
              <Link href="/actualites">
                {t("newsSection.viewAll")}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Horizontal scroll container */}
      <div
        ref={scrollRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide md:gap-6 md:px-[max(1rem,calc((100vw-80rem)/2+1rem))]"
        role="region"
        aria-roledescription="carrousel"
        aria-label={t("a11y.carousel")}
        tabIndex={0}
      >
        {news.map((article, index) => (
          <Link
            key={article.id}
            href={`/actualite/${article.slug}`}
            className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-primary/30 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:w-[340px]"
            role="group"
            aria-roledescription="diapositive"
            aria-label={t("a11y.slide", { current: index + 1, total: news.length })}
          >
            {/* Cover image or gradient placeholder */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
              {article.coverImage && (
                <img
                  src={article.coverImage}
                  alt={article.title}
                  width={680}
                  height={383}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                />
              )}
            </div>

            <div className="flex flex-1 flex-col p-4">
              <time
                dateTime={new Date(article.publishedAt).toISOString()}
                className="text-xs text-muted-foreground"
              >
                {formatNewsDate(article.publishedAt, locale)}
              </time>
              <h3 className="mt-1.5 font-serif text-base font-bold leading-snug text-foreground group-hover:text-primary transition-colors md:text-lg">
                {article.title}
              </h3>
              {article.excerpt && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {article.excerpt}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Button asChild variant="outline" className="gap-1" aria-label={t("newsSection.viewAllLabel")}>
          <Link href="/actualites">
            {t("newsSection.viewAll")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

export { NewsCarousel }
