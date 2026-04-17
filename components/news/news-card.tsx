import { Link } from "@/lib/i18n/routing"
import { getLocale } from "next-intl/server"
import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { NewsListItem } from "@/lib/queries/news"

type NewsCardProps = {
  article: NewsListItem
  className?: string
  priority?: boolean
}

const NewsCard = async ({ article, className, priority = false }: NewsCardProps) => {
  const locale = await getLocale()
  const dateLocale = locale === "en" ? "en-GB" : "fr-FR"

  const formattedDate = article.publishedAt
    ? new Intl.DateTimeFormat(dateLocale, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(article.publishedAt))
    : ""

  return (
    <Link
      href={`/actualite/${article.slug}`}
      className={cn(
        "group hover:border-primary/30 hover:shadow-primary/5 focus-visible:ring-primary/50 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl transition-all hover:bg-white/10 hover:shadow-lg focus-visible:ring-2 focus-visible:outline-none",
        className
      )}
    >
      <div className="from-primary/20 to-primary/5 relative aspect-[16/9] w-full overflow-hidden bg-gradient-to-br">
        {article.coverImage && (
          <img
            src={article.coverImage}
            alt={article.title}
            width={680}
            height={383}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading={priority ? "eager" : "lazy"}
            fetchPriority={priority ? "high" : "auto"}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="text-muted-foreground flex items-center gap-1.5 text-sm">
          <Calendar className="size-3.5 shrink-0" aria-hidden="true" />
          <time dateTime={article.publishedAt ? new Date(article.publishedAt).toISOString() : ""}>
            {formattedDate}
          </time>
        </div>

        <h2 className="text-foreground group-hover:text-primary mt-2 line-clamp-2 font-serif text-lg leading-snug font-bold transition-colors md:text-xl">
          {article.title}
        </h2>

        {article.excerpt && (
          <p className="text-muted-foreground mt-auto line-clamp-2 pt-2 text-sm">
            {article.excerpt}
          </p>
        )}
      </div>
    </Link>
  )
}

export { NewsCard }
