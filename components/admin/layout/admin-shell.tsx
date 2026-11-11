"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar"
import { AdminSidebarMobile } from "@/components/admin/layout/admin-sidebar-mobile"

type AdminShellProps = {
  user: {
    name: string
    email: string
    role: string
  }
  children: React.ReactNode
}

const AdminShell = ({ user, children }: AdminShellProps) => {
  const pathname = usePathname()
  const t = useTranslations("admin")
  const tA11y = useTranslations("a11y")

  // Auth pages (login, setup-account) and preview pages don't get the sidebar
  const isAuthPage = pathname.includes("/admin/login") || pathname.includes("/admin/setup-account")
  const isPreviewPage = pathname.includes("/admin/preview/")

  if (isAuthPage || isPreviewPage) {
    return <div className="bg-background flex min-h-dvh flex-col">{children}</div>
  }

  return (
    <div className="bg-background flex h-dvh w-full">
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-lg focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:outline-none"
      >
        {tA11y("skipToContent")}
      </a>

      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <AdminSidebar user={user} pathname={pathname} />
      </div>

      {/* Main Content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile Top Bar */}
        <div className="flex h-16 items-center gap-4 border-b border-white/10 bg-white/5 px-4 backdrop-blur-xl lg:hidden">
          <AdminSidebarMobile user={user} pathname={pathname} />
          <span className="text-sm font-bold text-white">{t("title")}</span>
        </div>

        {/* Content Area */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-4 focus:outline-none md:p-8"
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export { AdminShell }
