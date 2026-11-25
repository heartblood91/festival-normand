import { getTranslations } from "next-intl/server"
import { ExternalLink, Ticket } from "lucide-react"
import { normalizePassPatrimoineUrl, withPassUtm } from "@/lib/pass-patrimoine/url"

type PassPatrimoineCalloutProps = {
  url: string | null
  /** Master switch from the site settings. */
  enabled: boolean
}

/** "Accessible avec le Pass Patrimoine" note on the event page, linking to the site's pass page. */
export const PassPatrimoineCallout = async ({ url, enabled }: PassPatrimoineCalloutProps) => {
  // Re-checked here: an old row could predate the admin validation.
  const page = enabled && url ? normalizePassPatrimoineUrl(url) : null
  if (!page) return null
  const t = await getTranslations("passPatrimoine")

  return (
    <section
      aria-labelledby="pass-patrimoine-title"
      data-testid="pass-patrimoine-callout"
      className="border-primary/40 bg-ed-bg-deep mt-12 flex flex-col gap-4 border p-6"
    >
      <p className="text-primary flex items-center gap-2 font-mono text-xs tracking-[0.22em] uppercase">
        <Ticket className="size-4" aria-hidden="true" />
        {t("marker")}
      </p>
      <h2
        id="pass-patrimoine-title"
        className="text-foreground font-display text-2xl leading-tight font-normal md:text-3xl"
      >
        {t("title")}
      </h2>
      <p className="text-ed-bone font-serif text-base leading-relaxed">{t("lede")}</p>
      <p className="text-ed-bone font-serif text-sm italic">{t("note")}</p>
      <a
        href={withPassUtm(page)}
        target="_blank"
        rel="noopener noreferrer"
        className="border-primary text-primary hover:bg-primary/10 focus-visible:ring-primary/60 inline-flex min-h-11 items-center gap-2 self-start border px-5 font-sans text-xs font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        {t("cta")}
        <ExternalLink className="size-4" aria-hidden="true" />
        <span className="sr-only">{t("newTab")}</span>
      </a>
    </section>
  )
}
