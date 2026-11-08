"use client"

import { useId, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { BookmarkPlus, Copy, Mail, Printer, Share2 } from "lucide-react"
import { Link } from "@/lib/i18n/routing"
import { shareTravelBook } from "@/lib/actions/travel-book"
import { useFavorites } from "@/lib/travel-book/use-favorites"

const ACTION_CLASS =
  "border-primary/50 text-primary hover:bg-primary/10 focus-visible:ring-primary/50 inline-flex min-h-11 items-center gap-2 border px-4 font-sans text-[11px] font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none disabled:opacity-60"

export const PrintButton = () => {
  const t = useTranslations("travelBook")
  return (
    <button type="button" onClick={() => window.print()} className={ACTION_CLASS}>
      <Printer className="size-4" aria-hidden="true" />
      {t("print")}
    </button>
  )
}

type ShareState =
  | { status: "idle" | "sharing" | "error" }
  | { status: "ready"; url: string; copied?: boolean; copyFailed?: boolean }

export const ShareTravelBook = ({ eventIds }: { eventIds: string[] }) => {
  const t = useTranslations("travelBook")
  const locale = useLocale()
  const inputId = useId()
  const [state, setState] = useState<ShareState>({ status: "idle" })

  const share = async () => {
    setState({ status: "sharing" })
    const result = await shareTravelBook(eventIds)
    setState(
      result.success
        ? { status: "ready", url: `${window.location.origin}/${locale}/carnet/${result.id}` }
        : { status: "error" }
    )
  }

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setState({ status: "ready", url, copied: true })
    } catch {
      setState({ status: "ready", url, copyFailed: true })
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={share}
        disabled={state.status === "sharing"}
        className={ACTION_CLASS}
      >
        <Share2 className="size-4" aria-hidden="true" />
        {state.status === "sharing" ? t("sharing") : t("share")}
      </button>

      <div aria-live="polite" className="font-serif text-sm">
        {state.status === "error" ? <p className="text-destructive">{t("shareError")}</p> : null}
        {state.status === "ready" ? (
          <div className="border-primary/25 bg-ed-bg-soft flex flex-col gap-3 border p-4">
            <p className="text-ed-bone">{t("shareReady")}</p>
            <label htmlFor={inputId} className="sr-only">
              {t("shareLabel")}
            </label>
            <input
              id={inputId}
              readOnly
              value={state.url}
              onFocus={(event) => event.currentTarget.select()}
              className="border-primary/30 bg-background text-foreground min-h-11 w-full min-w-0 border px-3 font-mono text-xs"
            />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => copy(state.url)} className={ACTION_CLASS}>
                <Copy className="size-4" aria-hidden="true" />
                {t("copy")}
              </button>
              <a
                href={`mailto:?subject=${encodeURIComponent(t("emailSubject"))}&body=${encodeURIComponent(t("emailBody", { url: state.url }))}`}
                className={ACTION_CLASS}
              >
                <Mail className="size-4" aria-hidden="true" />
                {t("email")}
              </a>
            </div>
            {state.copied ? <p className="text-primary">{t("copied")}</p> : null}
            {state.copyFailed ? <p className="text-destructive">{t("copyFailed")}</p> : null}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export const ImportTravelBook = ({ eventIds }: { eventIds: string[] }) => {
  const t = useTranslations("travelBook")
  const { addMany } = useFavorites()
  const [done, setDone] = useState(false)

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => {
          addMany(eventIds)
          setDone(true)
        }}
        className={ACTION_CLASS}
      >
        <BookmarkPlus className="size-4" aria-hidden="true" />
        {t("importAll")}
      </button>
      <p aria-live="polite" className="font-serif text-sm">
        {done ? (
          <>
            <span className="text-primary">{t("imported")}</span>{" "}
            <Link href="/carnet" className="text-foreground underline underline-offset-4">
              {t("openMine")}
            </Link>
          </>
        ) : null}
      </p>
    </div>
  )
}
