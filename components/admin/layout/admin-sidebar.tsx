"use client"

import Link from "next/link"
import { useLocale, useTranslations } from "next-intl"
import {
  LayoutDashboard,
  ChartColumn,
  Calendar,
  Tags,
  ClipboardList,
  Images,
  MessageSquareQuote,
  Newspaper,
  Handshake,
  FileText,
  UserPlus,
  CalendarRange,
  ArchiveRestore,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
} from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SparkleIcon } from "@/components/ui/sparkle-icon"
import { ContrastToggle } from "@/components/layout/contrast-toggle"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { SidebarNavItem } from "@/components/admin/layout/sidebar-nav-item"

type AdminSidebarProps = {
  user: {
    name: string
    email: string
    role: string
  }
  pathname: string
  /** Closes the mobile drawer after a link is followed. */
  onNavigate?: () => void
  /** Extra control in the header, e.g. the drawer's close button. */
  headerAction?: React.ReactNode
  className?: string
}

const AdminSidebar = ({
  user,
  pathname,
  onNavigate,
  headerAction,
  className,
}: AdminSidebarProps) => {
  const locale = useLocale()
  const t = useTranslations("admin")
  const tA11y = useTranslations("a11y")

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch {
      // signOut may throw on network issues — redirect anyway
    }
    window.location.href = `/${locale}/admin/login`
  }

  const navItems = [
    {
      href: `/${locale}/admin`,
      icon: LayoutDashboard,
      labelKey: "sidebar.dashboard",
    },
    {
      href: `/${locale}/admin/stats`,
      icon: ChartColumn,
      labelKey: "sidebar.stats",
    },
    {
      href: `/${locale}/admin/events`,
      icon: Calendar,
      labelKey: "sidebar.events",
    },
    {
      href: `/${locale}/admin/themes`,
      icon: Tags,
      labelKey: "sidebar.themes",
    },
    {
      href: `/${locale}/admin/news`,
      icon: Newspaper,
      labelKey: "sidebar.news",
    },
    {
      href: `/${locale}/admin/partners`,
      icon: Handshake,
      labelKey: "sidebar.partners",
    },
    {
      href: `/${locale}/admin/pages`,
      icon: FileText,
      labelKey: "sidebar.pages",
    },
    {
      href: `/${locale}/admin/surveys`,
      icon: ClipboardList,
      labelKey: "sidebar.surveys",
    },
    {
      href: `/${locale}/admin/gallery`,
      icon: Images,
      labelKey: "sidebar.gallery",
    },
    {
      href: `/${locale}/admin/reviews`,
      icon: MessageSquareQuote,
      labelKey: "sidebar.reviews",
    },
    {
      href: `/${locale}/admin/inscription`,
      icon: UserPlus,
      labelKey: "sidebar.registrationLinks",
    },
    {
      href: `/${locale}/admin/edition`,
      icon: CalendarRange,
      labelKey: "sidebar.edition",
    },
    {
      href: `/${locale}/admin/recovery`,
      icon: ArchiveRestore,
      labelKey: "sidebar.recovery",
    },
    {
      href: `/${locale}/admin/users`,
      icon: Users,
      labelKey: "sidebar.users",
    },
    {
      href: `/${locale}/admin/settings`,
      icon: Settings,
      labelKey: "sidebar.settings",
    },
  ]

  return (
    <aside
      className={cn(
        "flex w-64 flex-col border-r border-white/10 bg-white/5 backdrop-blur-xl",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-2">
          <SparkleIcon className="size-5" />
          <span className="text-foreground text-sm font-bold">{t("title")}</span>
        </div>
        {headerAction}
      </div>

      {/* Tools */}
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <LocaleSwitcher />
        <ContrastToggle />
      </div>

      {/* Back to site */}
      <div className="border-b border-white/10 px-3 py-2">
        <Link
          href={`/${locale}`}
          onClick={onNavigate}
          className="text-muted-foreground flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4 flex-shrink-0" />
          <span>{t("backToSite")}</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label={tA11y("mainNav")}>
        {navItems
          .filter((item) => item.labelKey !== "sidebar.users" || user.role === "ADMIN")
          .map((item) => (
            <SidebarNavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={t(item.labelKey)}
              pathname={pathname}
              onNavigate={onNavigate}
            />
          ))}
      </nav>

      {/* User info */}
      <div className="space-y-3 border-t border-white/10 px-3 py-4">
        <div className="rounded-lg bg-white/5 px-3 py-3">
          <p className="text-foreground truncate text-sm font-medium">{user.name}</p>
          <p className="text-muted-foreground truncate text-xs">{user.email}</p>
          <div
            className={cn(
              "mt-2 inline-block rounded px-2 py-1 text-xs font-medium",
              user.role === "ADMIN"
                ? "bg-amber-500/20 text-amber-300"
                : "bg-blue-500/20 text-blue-300"
            )}
          >
            {user.role === "ADMIN" ? t("common.admin") : t("common.editor")}
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="text-muted-foreground hover:text-foreground w-full justify-start gap-2 hover:bg-white/5"
        >
          <LogOut className="size-4" />
          <span>{t("common.logout")}</span>
        </Button>
      </div>
    </aside>
  )
}

export { AdminSidebar }
