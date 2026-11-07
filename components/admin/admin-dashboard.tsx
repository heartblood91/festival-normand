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
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SyncStatusCard } from "@/components/admin/sync-status-card"
import type { SyncRunSummary } from "@/lib/tourinsoft/sync"

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

export const AdminDashboard = ({ user, stats, todo, lastSyncRun }: AdminDashboardProps) => {
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
          return (
            <Link key={key} href={links[key]}>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:border-amber-500/30 md:p-6">
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    {t(`dashboard.${key}`)}
                  </p>
                  <div className={`rounded-lg p-2 ${bgColor}`}>
                    <Icon className={`size-4 ${color}`} aria-hidden="true" />
                  </div>
                </div>
                <p className="text-foreground mt-2 text-2xl font-bold md:text-3xl">
                  {statValues[key]}
                </p>
              </div>
            </Link>
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
            <Link href={`/${locale}/admin/events?status=draft`} className="block">
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 transition-all hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-amber-500" aria-hidden="true" />
                  <span className="text-foreground text-sm">{t("dashboard.totalEvents")}</span>
                </div>
                <span className="text-sm font-bold text-amber-500">{stats.draftEvents}</span>
              </div>
            </Link>
            <Link href={`/${locale}/admin/news?status=draft`} className="block">
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 transition-all hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <Newspaper className="size-4 text-blue-400" aria-hidden="true" />
                  <span className="text-foreground text-sm">{t("dashboard.totalNews")}</span>
                </div>
                <span className="text-sm font-bold text-blue-400">{stats.draftNews}</span>
              </div>
            </Link>
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
            <Link href={`/${locale}/admin/events?status=depublished`} className="block">
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 transition-all hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <Calendar className="size-4 text-orange-400" aria-hidden="true" />
                  <span className="text-foreground text-sm">{t("dashboard.totalEvents")}</span>
                </div>
                <span className="text-sm font-bold text-orange-400">{stats.depublishedEvents}</span>
              </div>
            </Link>
            <Link href={`/${locale}/admin/news?status=depublished`} className="block">
              <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 transition-all hover:bg-white/10">
                <div className="flex items-center gap-3">
                  <Newspaper className="size-4 text-orange-400" aria-hidden="true" />
                  <span className="text-foreground text-sm">{t("dashboard.totalNews")}</span>
                </div>
                <span className="text-sm font-bold text-orange-400">{stats.depublishedNews}</span>
              </div>
            </Link>
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
          {todoRows.map(({ key, filter, label, icon: Icon }) => (
            <Link
              key={key}
              href={`/${locale}/admin/events?todo=${filter}`}
              className="flex min-h-11 items-center justify-between gap-3 rounded-lg bg-white/5 px-4 py-3 transition-all hover:bg-white/10"
            >
              <span className="text-foreground flex items-center gap-3 text-sm">
                <Icon className="size-4 text-amber-500" aria-hidden="true" />
                {t(`dashboard.${label}`)}
              </span>
              <span className="text-sm font-bold text-amber-500">{todo[key]}</span>
            </Link>
          ))}
        </div>
      </section>

      <SyncStatusCard lastRun={lastSyncRun} />
    </div>
  )
}
