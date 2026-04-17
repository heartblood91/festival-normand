"use client"

import { useLocale, useTranslations } from "next-intl"
import {
  LayoutDashboard,
  Calendar,
  Newspaper,
  Handshake,
  FileText,
  Users,
  LogOut,
  Menu,
  ArrowLeft,
} from "lucide-react"
import { signOut } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "@/components/ui/sheet"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { SparkleIcon } from "@/components/ui/sparkle-icon"
import { ContrastToggle } from "@/components/layout/contrast-toggle"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { SidebarNavItem } from "@/components/admin/layout/sidebar-nav-item"

type AdminSidebarMobileProps = {
  user: {
    name: string
    email: string
    role: string
  }
  pathname: string
}

const AdminSidebarMobile = ({ user, pathname }: AdminSidebarMobileProps) => {
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
      href: `/${locale}/admin/events`,
      icon: Calendar,
      labelKey: "sidebar.events",
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
      href: `/${locale}/admin/users`,
      icon: Users,
      labelKey: "sidebar.users",
    },
  ]

  const truncateEmail = (email: string) => {
    if (email.length > 20) {
      return email.substring(0, 17) + "..."
    }
    return email
  }

  return (
    <Sheet>
      <SheetTrigger
        className="hover:text-foreground focus-visible:ring-ring/50 inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-medium hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
        aria-label={tA11y("openMenu")}
      >
        <Menu className="size-5" />
      </SheetTrigger>

      <SheetContent side="left" className="flex flex-col gap-0 p-0" showCloseButton={false}>
        {/* Header */}
        <SheetHeader className="border-b border-white/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <SparkleIcon className="size-5" />
              <span className="text-sm font-bold text-white">{t("title")}</span>
            </div>
            <SheetPrimitive.Close
              render={
                <Button variant="ghost" size="icon" className="h-auto w-auto p-0">
                  <span className="sr-only">{tA11y("closeMenu")}</span>
                </Button>
              }
            />
          </div>
        </SheetHeader>

        {/* Tools */}
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <LocaleSwitcher />
          <ContrastToggle />
        </div>

        {/* Back to site */}
        <div className="border-b border-white/10 px-3 py-2">
          <Button
            variant="ghost"
            asChild
            className="min-h-11 w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5"
            onClick={() => (window.location.href = `/${locale}`)}
          >
            <a href={`/${locale}`}>
              <ArrowLeft className="size-4 flex-shrink-0" />
              <span>{t("backToSite")}</span>
            </a>
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label={tA11y("mainNav")}>
          {navItems.map((item) => (
            <div key={item.href} onClick={() => (window.location.href = item.href)}>
              <SidebarNavItem
                href={item.href}
                icon={item.icon}
                label={t(item.labelKey)}
                pathname={pathname}
              />
            </div>
          ))}
        </nav>

        {/* User info */}
        <div className="space-y-3 border-t border-white/10 px-3 py-4">
          <div className="rounded-lg bg-white/5 px-3 py-3">
            <p className="truncate text-sm font-medium text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{truncateEmail(user.email)}</p>
            <div className="mt-2 inline-block rounded bg-amber-500/20 px-2 py-1 text-xs font-medium text-amber-300">
              {t("common.admin")}
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start gap-2 text-slate-400 hover:bg-white/5 hover:text-slate-200"
          >
            <LogOut className="size-4" />
            <span>{t("common.logout")}</span>
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { AdminSidebarMobile }
