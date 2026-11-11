import { getTranslations } from "next-intl/server"
import { BookOpen } from "lucide-react"

type HistoryLinkProps = {
  url: string | null
}

const HistoryLink = async ({ url }: HistoryLinkProps) => {
  if (!url) return null
  const t = await getTranslations()
  const host = new URL(url).hostname.replace(/^www\./, "")

  return (
    <p className="mt-8">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="border-primary/40 text-ed-bone hover:border-primary hover:text-primary focus-visible:ring-primary/50 inline-flex min-h-11 items-center gap-3 border px-4 py-2 transition-colors focus-visible:ring-2 focus-visible:outline-none"
      >
        <BookOpen className="text-primary size-5 shrink-0" aria-hidden="true" />
        <span className="font-serif text-lg italic">{t("events.history")}</span>{" "}
        <span className="text-ed-mute font-mono text-xs tracking-[0.12em] break-all">{host}</span>
        <span className="sr-only"> {t("a11y.newTab")}</span>
      </a>
    </p>
  )
}

export { HistoryLink }
