import type { ReactNode } from "react"
import { getTranslations } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import { MarkdownContent } from "@/components/news/markdown-content"
import { Marker } from "@/components/editorial/primitives"
import { stripLeadingTitle } from "@/lib/utils/markdown"

type ClassicPageProps = {
  title: string
  content: string
  /** Editorial kicker above the title */
  marker?: string
  /** Rendered before the markdown body (e.g. the actions a visitor came for) */
  lead?: ReactNode
  /** Rendered after the markdown body */
  children?: ReactNode
}

// Shared editorial shell for long-form markdown pages
// (festival, inscription, legal notice, accessibility statement).
const ClassicPage = async ({ title, content, marker, lead, children }: ClassicPageProps) => {
  const t = await getTranslations()

  return (
    <article>
      <nav
        aria-label={t("a11y.breadcrumb")}
        className="border-primary/15 bg-background border-b px-4 py-4 md:px-6"
      >
        <ol className="text-ed-mute mx-auto flex max-w-3xl flex-wrap items-center gap-2.5 font-mono text-xs tracking-[0.16em] uppercase">
          <li>
            <Link href="/" className="hover:text-primary transition-colors">
              {t("nav.home")}
            </Link>
          </li>
          <li aria-hidden="true" className="text-primary/50">
            ›
          </li>
          <li aria-current="page" className="text-primary truncate">
            {title}
          </li>
        </ol>
      </nav>

      <div className="bg-ed-bg-deep border-primary/25 border-b px-4 py-14 md:px-6 md:py-16">
        <div className="mx-auto max-w-3xl">
          <Marker className="mb-4">{marker ?? t("nav.festival")}</Marker>
          <h1 className="text-foreground font-display text-[clamp(2.25rem,6vw,4.5rem)] leading-[0.98] font-normal tracking-[-0.025em] italic">
            {title}
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 md:px-6 md:py-16">
        {lead}
        <MarkdownContent content={stripLeadingTitle(content, title)} />
        {children}
      </div>
    </article>
  )
}

export { ClassicPage }
