import type { KeyboardEvent, RefObject } from "react"
import { BarChart3, X } from "lucide-react"
import { useTranslations } from "next-intl"
import { cn } from "@/lib/utils"

export type CookieConsentValue = "accepted" | "refused"

type CookieBannerProps = {
  onAccept: () => void
  onRefuse: () => void
}

const actionButtonClassName =
  "focus-visible:ring-primary/50 inline-flex min-h-11 items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"

const CookieBanner = ({ onAccept, onRefuse }: CookieBannerProps) => {
  const t = useTranslations("cookies")

  return (
    <section
      className="fixed right-4 bottom-4 left-4 z-[80] grid max-h-[calc(100dvh-2rem)] gap-4 overflow-y-auto rounded-lg border border-white/10 bg-slate-950/95 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:left-auto md:w-[34rem] md:grid-cols-[auto_1fr]"
      aria-label={t("bannerAriaLabel")}
    >
      <div
        className="bg-primary/15 text-primary hidden size-12 items-center justify-center rounded-lg md:inline-flex"
        aria-hidden="true"
      >
        <BarChart3 className="size-6" />
      </div>
      <div>
        <h2 className="text-foreground font-serif text-xl leading-tight font-bold">{t("title")}</h2>
        <p className="text-muted-foreground mt-3 text-sm leading-6">{t("description")}</p>
        <p className="text-muted-foreground/90 mt-2 text-sm leading-6">{t("note")}</p>
      </div>
      <div className="flex flex-col gap-2 md:col-span-2 md:flex-row md:flex-wrap">
        <button
          type="button"
          className={cn(
            actionButtonClassName,
            "bg-primary text-primary-foreground hover:bg-primary/90"
          )}
          onClick={onAccept}
        >
          {t("accept")}
        </button>
        <button
          type="button"
          className={cn(
            actionButtonClassName,
            "text-foreground border border-white/15 bg-white/5 hover:bg-white/10"
          )}
          onClick={onRefuse}
        >
          {t("refuse")}
        </button>
        <button
          type="button"
          className={cn(
            actionButtonClassName,
            "text-muted-foreground hover:text-foreground underline underline-offset-4"
          )}
          onClick={onRefuse}
        >
          {t("continueWithoutAccepting")}
        </button>
      </div>
    </section>
  )
}

type CookieStatusPillProps = {
  consent: CookieConsentValue
  onManage: () => void
}

const CookieStatusPill = ({ consent, onManage }: CookieStatusPillProps) => {
  const t = useTranslations("cookies")
  const isAccepted = consent === "accepted"

  return (
    <button
      type="button"
      className="text-foreground focus-visible:ring-primary/50 fixed right-0 bottom-4 z-[70] inline-flex min-h-11 items-center gap-2 rounded-l-full border border-r-0 border-white/10 bg-slate-950/95 px-3 py-2 text-xs font-semibold shadow-xl shadow-black/30 backdrop-blur-xl transition-colors hover:bg-slate-900 focus-visible:ring-2 focus-visible:outline-none"
      aria-label={isAccepted ? t("manageEnabled") : t("manageDisabled")}
      onClick={onManage}
    >
      <BarChart3 className="size-4" aria-hidden="true" />
      <span
        className={cn("size-2 rounded-full", isAccepted ? "bg-emerald-400" : "bg-red-400")}
        aria-hidden="true"
      />
      <span className="hidden sm:inline">{t("shortLabel")}</span>
    </button>
  )
}

type CookiePreferencesModalProps = {
  closeButtonRef: RefObject<HTMLButtonElement | null>
  modalRef: RefObject<HTMLDivElement | null>
  statsEnabled: boolean
  onClose: () => void
  onRefuse: () => void
  onSave: () => void
  onToggleStats: () => void
  onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void
}

const CookiePreferencesModal = ({
  closeButtonRef,
  modalRef,
  statsEnabled,
  onClose,
  onRefuse,
  onSave,
  onToggleStats,
  onKeyDown,
}: CookiePreferencesModalProps) => {
  const t = useTranslations("cookies")

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
      onClick={onClose}
      onKeyDown={onKeyDown}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-modal-title"
        className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-lg border border-white/10 bg-slate-950 p-5 shadow-2xl shadow-black/50"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="cookie-modal-title" className="text-foreground font-serif text-2xl font-bold">
            {t("modalTitle")}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 inline-flex size-11 items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:outline-none"
            aria-label={t("close")}
            onClick={onClose}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <p className="text-muted-foreground mt-4 text-sm leading-6">{t("modalDescription")}</p>

        <div className="mt-5 flex items-start justify-between gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <div>
            <h3 className="text-foreground text-sm font-semibold">{t("statsTitle")}</h3>
            <p className="text-muted-foreground mt-1 text-sm leading-6">{t("statsDescription")}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={statsEnabled}
            aria-label={statsEnabled ? t("disableStats") : t("enableStats")}
            className={cn(
              "focus-visible:ring-primary/50 relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:ring-2 focus-visible:outline-none",
              statsEnabled ? "bg-emerald-500" : "bg-slate-600"
            )}
            onClick={onToggleStats}
          >
            <span
              className={cn(
                "absolute top-1 left-0 size-5 rounded-full bg-white shadow-sm transition-transform",
                statsEnabled ? "translate-x-6" : "translate-x-1"
              )}
            />
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            className={cn(
              actionButtonClassName,
              "bg-primary text-primary-foreground hover:bg-primary/90"
            )}
            onClick={onSave}
          >
            {t("save")}
          </button>
          <button
            type="button"
            className={cn(
              actionButtonClassName,
              "text-foreground border border-white/15 bg-white/5 hover:bg-white/10"
            )}
            onClick={onRefuse}
          >
            {t("refuseAll")}
          </button>
        </div>
      </div>
    </div>
  )
}

export { CookieBanner, CookiePreferencesModal, CookieStatusPill }
