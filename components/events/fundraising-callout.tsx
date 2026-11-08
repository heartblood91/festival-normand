import Image from "next/image"
import { getTranslations } from "next-intl/server"
import { ExternalLink, HandHeart } from "lucide-react"
import { cn } from "@/lib/utils"
import { isFundraisingImageUrl, isFundraisingUrl } from "@/lib/fundraising/fondation"

type FundraisingCalloutProps = {
  url: string | null
  title: string | null
  image: string | null
}

/** Call to donate to the Fondation du patrimoine collect attached to the event. */
export const FundraisingCallout = async ({ url, title, image }: FundraisingCalloutProps) => {
  // Re-checked here: an old row could predate the admin validation.
  if (!url || !isFundraisingUrl(url)) return null
  const t = await getTranslations("fundraising")
  const picture = image && isFundraisingImageUrl(image) ? image : null

  return (
    <section
      aria-labelledby="fundraising-title"
      className={cn(
        "border-primary/40 bg-ed-bg-deep mt-12 grid overflow-hidden border",
        picture && "md:grid-cols-[220px_1fr]"
      )}
    >
      {picture ? (
        <div className="relative aspect-[16/9] md:aspect-auto">
          {/* Decorative: the collect title is written next to it. */}
          <Image
            src={picture}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 220px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="flex flex-col gap-4 p-6">
        <p className="text-primary flex items-center gap-2 font-mono text-[10.5px] tracking-[0.22em] uppercase">
          <HandHeart className="size-4" aria-hidden="true" />
          {t("marker")}
        </p>
        <h2
          id="fundraising-title"
          className="text-foreground font-display text-2xl leading-tight font-normal md:text-3xl"
        >
          {t("title")}
        </h2>
        {title ? <p className="text-ed-bone font-serif text-lg italic">{title}</p> : null}
        <p className="text-ed-bone font-serif text-base leading-relaxed">{t("lede")}</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-primary/60 inline-flex min-h-11 items-center gap-2 self-start px-5 font-sans text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          {t("cta")}
          <ExternalLink className="size-4" aria-hidden="true" />
          <span className="sr-only">{t("newTab")}</span>
        </a>
      </div>
    </section>
  )
}
