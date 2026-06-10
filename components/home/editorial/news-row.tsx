import { getTranslations, getLocale } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import type { Locale } from "@/lib/i18n/config"
import type { EditionMode } from "@/lib/festival/edition"
import type { LatestNewsItem } from "@/lib/queries/homepage"
import { formatNewsDate } from "@/lib/utils/format-date"
import { SectionHeading } from "@/components/editorial/primitives"

type NewsRowProps = {
  news: LatestNewsItem[]
  mode: EditionMode
  markerIndex?: string
}

const NewsRow = async ({ news, mode, markerIndex = "03" }: NewsRowProps) => {
  if (news.length === 0) return null
  const t = await getTranslations()
  const locale = (await getLocale()) as Locale

  return (
    <section className="bg-background px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          markerIndex={markerIndex}
          marker={t(`editorial.newsSection.marker${mode === "bilan" ? "Past" : "Upcoming"}`)}
          title={t(`editorial.newsSection.title${mode === "bilan" ? "Past" : "Upcoming"}`)}
          action={
            <Link
              href="/actualites"
              className="text-primary hover:text-ed-amber-soft focus-visible:ring-primary/50 border-primary inline-flex items-center rounded-sm border-b pb-1 font-sans text-xs tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("editorial.allNews")}
            </Link>
          }
        />

        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {news.slice(0, 3).map((item) => (
            <li key={item.id} className="flex">
              <Link
                href={`/actualite/${item.slug}`}
                className="bg-ed-bg-soft border-primary/20 hover:border-primary/45 focus-visible:ring-primary/50 group flex flex-1 flex-col gap-5 border p-7 transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {item.publishedAt ? (
                  <span className="text-primary font-mono text-[10px] tracking-[0.18em] uppercase opacity-85">
                    {formatNewsDate(item.publishedAt, locale)}
                  </span>
                ) : null}
                <h3 className="text-foreground font-display text-2xl leading-tight font-normal tracking-tight italic">
                  {item.title}
                </h3>
                {item.excerpt ? (
                  <p className="text-ed-bone line-clamp-4 flex-1 font-serif text-base font-light">
                    {item.excerpt}
                  </p>
                ) : (
                  <span className="flex-1" />
                )}
                <span className="border-primary/25 text-primary flex items-center justify-between border-t pt-4 font-sans text-[11px] tracking-[0.16em] uppercase">
                  {t("editorial.readArticle")}
                  <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export { NewsRow }
