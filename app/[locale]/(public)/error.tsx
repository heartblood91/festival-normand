"use client"

import { useEffect } from "react"
import { useTranslations } from "next-intl"
import { RefreshCcw } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { Marker, Rule } from "@/components/editorial/primitives"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

// Same editorial frame as the 404: rendered inside the public layout, header and footer stay.
const PublicError = ({ error, reset }: ErrorProps) => {
  const t = useTranslations("errorPage")

  useEffect(() => {
    console.error("Public page error:", error)
  }, [error])

  return (
    <div className="bg-ed-bg-deep flex min-h-[70vh] items-center justify-center px-4 py-20 md:px-6">
      <div className="mx-auto max-w-2xl text-center">
        <Marker className="mb-5">{t("marker")}</Marker>
        <h1 className="text-foreground font-display text-[clamp(2.5rem,8vw,5rem)] leading-[0.95] font-normal tracking-[-0.025em] italic">
          {t("title")}
        </h1>
        <p className="text-ed-bone mx-auto mt-7 max-w-xl font-serif text-xl font-light italic">
          {t("text")}
        </p>
        {error.digest && (
          <p className="text-ed-mute mt-4 font-mono text-xs">
            {t("reference", { id: error.digest })}
          </p>
        )}
        <Rule />
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="bg-primary text-primary-foreground hover:bg-ed-amber-deep focus-visible:ring-ring inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 px-8 py-4 font-sans text-xs font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
          >
            <RefreshCcw className="size-4" aria-hidden="true" />
            {t("retry")}
          </button>
          <Link
            href="/"
            className="border-ed-cream/50 text-foreground hover:border-primary hover:text-primary focus-visible:ring-primary/50 inline-flex min-h-11 w-full items-center justify-center border px-8 py-4 font-sans text-xs font-medium tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none sm:w-auto"
          >
            {t("home")}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PublicError
