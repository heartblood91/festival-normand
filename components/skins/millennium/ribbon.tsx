import { ArrowRight } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { millenniumCopy } from "@/components/skins/millennium/copy"
import type { SkinSlotProps } from "@/components/skins/types"

/** Heraldic red band above the header; scrolls away with the page. */
export const MillenniumRibbon = ({ locale, themeSlug }: SkinSlotProps) => {
  const copy = millenniumCopy(locale)
  return (
    <aside
      aria-label={copy.title}
      className="border-b border-[#f59e0b]/60 bg-[#7f1d1d] text-[#f4ebd9] print:hidden"
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center md:justify-between md:px-6">
        <p className="flex items-center gap-3 font-serif text-sm md:text-base">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/themes/millennium-emblem.svg"
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0"
          />
          <span>
            <span className="font-semibold">{copy.title}</span>
            <span aria-hidden="true"> · </span>
            <span className="whitespace-nowrap tabular-nums">{copy.dates}</span>
          </span>
        </p>
        <Link
          href={`/evenements?theme=${encodeURIComponent(themeSlug)}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline decoration-[#f59e0b] underline-offset-4 hover:decoration-2 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4ebd9]"
        >
          {copy.cta}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
    </aside>
  )
}
