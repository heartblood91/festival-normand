"use client"

import { useFormatter, useTranslations } from "next-intl"
import { RefreshCw } from "lucide-react"
import type { SyncRunSummary } from "@/lib/tourinsoft/sync"

const STATUS_COLORS: Record<SyncRunSummary["status"], string> = {
  RUNNING: "bg-blue-400/10 text-blue-300",
  SUCCESS: "bg-emerald-400/10 text-emerald-300",
  PARTIAL: "bg-amber-500/10 text-amber-300",
  FAILED: "bg-red-500/10 text-red-300",
}

export const SyncStatusCard = ({ lastRun }: { lastRun: SyncRunSummary | null }) => {
  const t = useTranslations("admin.dashboard.sync")
  const format = useFormatter()

  return (
    <section
      aria-labelledby="sync-status-title"
      className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id="sync-status-title"
          className="text-foreground flex items-center gap-2 font-serif text-lg font-bold"
        >
          <RefreshCw className="size-5 text-amber-500" aria-hidden="true" />
          {t("title")}
        </h2>
        {lastRun && (
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_COLORS[lastRun.status]}`}
          >
            {t(`status.${lastRun.status}`)}
          </span>
        )}
      </div>
      {lastRun ? (
        <div className="text-muted-foreground mt-3 space-y-1 text-sm">
          <p>
            {t("lastRun", {
              date: format.dateTime(new Date(lastRun.startedAt), {
                dateStyle: "medium",
                timeStyle: "short",
              }),
            })}
          </p>
          <p>
            {t("counts", {
              created: lastRun.created,
              updated: lastRun.updated,
              skipped: lastRun.skipped,
              failed: lastRun.failed,
            })}
          </p>
          <p className="text-xs">{t("trigger", { trigger: lastRun.trigger })}</p>
        </div>
      ) : (
        <p className="text-muted-foreground mt-3 text-sm">{t("never")}</p>
      )}
    </section>
  )
}
