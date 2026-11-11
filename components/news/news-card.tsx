import { Link } from "@/lib/i18n/routing"
import Image from "next/image"
import { getLocale } from "next-intl/server"
import { cn } from "@/lib/utils"
import { EventThumb } from "@/components/editorial/event-thumb"
import { formatNewsDate } from "@/lib/utils/format-date"
import type { NewsListItem } from "@/lib/queries/news"

type NewsCardProps = {
  article: NewsListItem
  className?: string
  priority?: boolean
}

const NewsCard = async ({ article, className, priority = false }: NewsCardProps) => {
  const locale = await getLocale()

  return (
    <Link
      href={`/actualite/${article.slug}`}
      className={cn(
        "group bg-ed-bg-soft border-primary/20 hover:border-primary/50 focus-visible:ring-primary/50 flex flex-col border transition-colors focus-visible:ring-2 focus-visible:outline-none",
        className
      )}
    >
      <div className="bg-ed-bg-deep relative aspect-[16/10] w-full overflow-hidden">
        {article.coverImage ? (
          // Decorative: the card link is named by the article title.
          <Image
            src={article.coverImage}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
          />
        ) : (
          <div data-testid="news-thumb-fallback" className="absolute inset-0">
            <EventThumb
              category="ILLUMINATIONS"
              title={article.title}
              seed={article.slug}
              className="h-full w-full border-0"
            />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-6">
        {article.publishedAt ? (
          <time
            dateTime={new Date(article.publishedAt).toISOString()}
            className="text-primary font-mono text-xs tracking-[0.18em] uppercase opacity-85"
          >
            {formatNewsDate(article.publishedAt, locale)}
          </time>
        ) : null}
        <h2 className="text-foreground group-hover:text-primary font-display text-xl leading-tight font-normal tracking-tight italic transition-colors">
          {article.title}
        </h2>
        {article.excerpt ? (
          <p className="text-ed-bone line-clamp-3 font-serif text-base font-light">
            {article.excerpt}
          </p>
        ) : null}
        <span className="border-primary/20 text-primary mt-auto flex items-center justify-between border-t pt-3 font-sans text-xs tracking-[0.16em] uppercase">
          <span className="group-hover:text-ed-amber-soft transition-colors">
            {locale === "en" ? "Read" : "Lire"}
          </span>
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
            →
          </span>
        </span>
      </div>
    </Link>
  )
}

export { NewsCard }
