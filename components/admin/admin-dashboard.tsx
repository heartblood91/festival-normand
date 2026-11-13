"use client"

import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import {
  Calendar,
  Newspaper,
  Handshake,
  FileText,
  Plus,
  FileEdit,
  EyeOff,
  Info,
  ListTodo,
  Languages,
  ImageOff,
  MapPinOff,
  type LucideIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SyncStatusCard } from "@/components/admin/sync-status-card"
import { TextCorrectionCard } from "@/components/admin/text-correction-card"
import type { SyncRunSummary } from "@/lib/tourinsoft/sync"
import { cn } from "@/lib/utils"

type AdminDashboardProps = {
  user: {
    id: string
    name: string
    email: string
  }
  stats: {
    events: number
    news: number
    partners: number
    pages: number
    draftEvents: number
    draftNews: number
    depublishedEvents: number
    depublishedNews: number
  }
  todo: { missingEn: number; missingAlt: number; missingGps: number }
  lastSyncRun: SyncRunSummary | null
  textCorrection: { pending: number; aiConfigured: boolean }
}

const todoRows = [
  { key: "missingEn", filter: "missing-en", label: "todoMissingEn", icon: Languages },
  { key: "missingAlt", filter: "missing-alt", label: "todoMissingAlt", icon: ImageOff },
  { key: "missingGps", filter: "missing-gps", label: "todoMissingGps", icon: MapPinOff },
] as const

const statCards = [
  { key: "totalEvents", icon: Calendar, color: "text-amber-500", bgColor: "bg-amber-500/10" },
  { key: "totalNews", icon: Newspaper, color: "text-blue-400", bgColor: "bg-blue-400/10" },
  {
    key: "totalPartners",
    icon: Handshake,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
  { key: "totalPages", icon: FileText, color: "text-purple-400", bgColor: "bg-purple-400/10" },
] as const

type CounterRowProps = {
  href: string
  count: number
  icon: LucideIcon
  tone: string
  label: string
  none: string
}

/** A zero is said in words and is not a link to an empty list. */
const CounterRow = ({ href, count, icon: Icon, tone, label, none }: CounterRowProps) => {
  const content = (
    <>
      <span className="text-foreground flex items-center gap-3 text-sm">
        <Icon className={cn("size-4", tone)} aria-hidden="true" />
        {label}
      </span>
      {count > 0 ? (
        <span className={cn("text-sm font-bold", tone)}>{count}</span>
      ) : (
        <span className="text-muted-foreground text-xs">{none}</span>
      )}
    </>
  )
  const row = "flex min-h-11 items-center justify-between gap-3 rounded-lg px-4 py-3"
  return count > 0 ? (
    <Link
      href={href}
      data-testid="dashboard-counter"
      data-count={count}
      className={cn(
        row,
        "bg-white/5 transition-all hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:outline-none"
      )}
    >
      {content}
    </Link>
  ) : (
    <div
      data-testid="dashboard-counter"
      data-count={0}
      className={cn(row, "border border-dashed border-white/10")}
    >
      {content}
    </div>
  )
}

export const AdminDashboard = ({
  user,
  stats,
  todo,
  lastSyncRun,
  textCorrection,
}: AdminDashboardProps) => {
  const t = useTranslations("admin")
  const locale = useLocale()

  const statValues: Record<string, number> = {
    totalEvents: stats.events,
    totalNews: stats.news,
    totalPartners: stats.partners,
    totalPages: stats.pages,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-foreground font-serif text-2xl font-bold md:text-3xl">
          {t("dashboard.title")}
        </h1>
        <p className="text-muted-foreground mt-1">
          {t("dashboard.greeting", { name: user.name || user.email })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map(({ key, icon: Icon, color, bgColor }) => {
          const links: Record<string, string> = {
            totalEvents: `/${locale}/admin/events?status=published`,
            totalNews: `/${locale}/admin/news?status=published`,
            totalPartners: `/${locale}/admin/partners`,
            totalPages: `/${locale}/admin/pages`,
          }
          const count = statValues[key]
          const card = (
            <>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  {t(`dashboard.${key}`)}
                </p>
                <div className={`rounded-lg p-2 ${bgColor}`}>
                  <Icon className={`size-4 ${color}`} aria-hidden="true" />
                </div>
              </div>
              {count > 0 ? (
                <p className="text-foreground mt-2 text-2xl font-bold md:text-3xl">{count}</p>
              ) : (
                <p className="text-muted-foreground mt-3 text-sm">{t("dashboard.none")}</p>
              )}
            </>
          )
          const box = "rounded-xl border bg-white/5 p-4 backdrop-blur-xl md:p-6"
          return count > 0 ? (
            <Link
              key={key}
              href={links[key]}
              data-testid="dashboard-counter"
              data-count={count}
              className={cn(
                box,
                "border-white/10 transition-all hover:border-amber-500/30 focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:outline-none"
              )}
            >
              {card}
            </Link>
          ) : (
            <div
              key={key}
              data-testid="dashboard-counter"
              data-count={0}
              className={cn(box, "border-dashed border-white/15")}
            >
              {card}
            </div>
          )
        })}
      </div>

      {/* Drafts + Depublished + Quick actions — 3 columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Drafts — never published, work in progress */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-foreground mb-2 flex items-center gap-2 font-serif text-lg font-bold">
            <FileEdit className="size-5 text-amber-500" aria-hidden="true" />
            {t("dashboard.drafts")}
          </h2>
          <p className="text-muted-foreground mb-4 text-xs" title={t("dashboard.draftsTooltip")}>
            <Info className="mr-1 inline size-3" aria-hidden="true" />
            {t("dashboard.draftsDescription")}
          </p>
          <div className="flex flex-col gap-3">
            <CounterRow
              href={`/${locale}/admin/events?status=draft`}
              count={stats.draftEvents}
              icon={Calendar}
              tone="text-amber-500"
              label={t("dashboard.totalEvents")}
              none={t("dashboard.none")}
            />
            <CounterRow
              href={`/${locale}/admin/news?status=draft`}
              count={stats.draftNews}
              icon={Newspaper}
              tone="text-blue-400"
              label={t("dashboard.totalNews")}
              none={t("dashboard.none")}
            />
          </div>
        </div>

        {/* Depublished — was published, now hidden */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-foreground mb-2 flex items-center gap-2 font-serif text-lg font-bold">
            <EyeOff className="size-5 text-orange-400" aria-hidden="true" />
            {t("dashboard.depublished")}
          </h2>
          <p className="text-muted-foreground mb-4 text-xs">
            <Info className="mr-1 inline size-3" aria-hidden="true" />
            {t("dashboard.depublishedDescription")}
          </p>
          <div className="flex flex-col gap-3">
            <CounterRow
              href={`/${locale}/admin/events?status=depublished`}
              count={stats.depublishedEvents}
              icon={Calendar}
              tone="text-orange-400"
              label={t("dashboard.totalEvents")}
              none={t("dashboard.none")}
            />
            <CounterRow
              href={`/${locale}/admin/news?status=depublished`}
              count={stats.depublishedNews}
              icon={Newspaper}
              tone="text-orange-400"
              label={t("dashboard.totalNews")}
              none={t("dashboard.none")}
            />
          </div>
        </div>

        {/* Quick actions */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-foreground mb-4 font-serif text-lg font-bold">
            {t("dashboard.quickActions")}
          </h2>
          <div className="space-y-3">
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start gap-3 border border-white/10 bg-white/5 hover:bg-white/10"
            >
              <Link href={`/${locale}/admin/events/new`}>
                <Plus className="size-4 text-amber-500" aria-hidden="true" />
                {t("dashboard.createEvent")}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start gap-3 border border-white/10 bg-white/5 hover:bg-white/10"
            >
              <Link href={`/${locale}/admin/news/new`}>
                <Plus className="size-4 text-blue-400" aria-hidden="true" />
                {t("dashboard.createNews")}
              </Link>
            </Button>
            <Button
              asChild
              variant="ghost"
              className="w-full justify-start gap-3 border border-white/10 bg-white/5 hover:bg-white/10"
            >
              <Link href={`/${locale}/admin/partners`}>
                <Handshake className="size-4 text-emerald-400" aria-hidden="true" />
                {t("dashboard.managePartners")}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Events to complete — each row opens the matching list filter */}
      <section
        aria-labelledby="dashboard-todo"
        className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      >
        <h2
          id="dashboard-todo"
          className="text-foreground mb-2 flex items-center gap-2 font-serif text-lg font-bold"
        >
          <ListTodo className="size-5 text-amber-500" aria-hidden="true" />
          {t("dashboard.todo")}
        </h2>
        <p className="text-muted-foreground mb-4 text-xs">{t("dashboard.todoDescription")}</p>
        <div className="grid gap-3 md:grid-cols-3">
          {todoRows.map(({ key, filter, label, icon }) => (
            <CounterRow
              key={key}
              href={`/${locale}/admin/events?todo=${filter}`}
              count={todo[key]}
              icon={icon}
              tone="text-amber-500"
              label={t(`dashboard.${label}`)}
              none={t("dashboard.none")}
            />
          ))}
        </div>
      </section>

      <SyncStatusCard lastRun={lastSyncRun} />
      <TextCorrectionCard {...textCorrection} />
    </div>
  )
}
