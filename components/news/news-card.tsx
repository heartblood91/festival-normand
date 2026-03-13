import Link from "next/link"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NewsListItem } from "@/lib/queries/news"

const formatNewsDate = (date: Date): string => {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

type NewsCardProps = {
  article: NewsListItem
  className?: string
}

const NewsCard = ({ article, className }: NewsCardProps) => {
  return (
    <Link
      href={`/actualite/${article.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:border-primary/30 hover:bg-white/10 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
        className
      )}
    >
      {/* Cover image or gradient placeholder */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
          <time dateTime={new Date(article.publishedAt).toISOString()}>
            {formatNewsDate(article.publishedAt)}
          </time>
        </div>

        <h2 className="mt-2 font-serif text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary md:text-xl">
          {article.title}
        </h2>

        {article.excerpt && (
          <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
            {article.excerpt}
          </p>
        )}
      </div>
    </Link>
  )
}

export { NewsCard }
