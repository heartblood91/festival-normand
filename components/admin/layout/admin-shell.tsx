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

  // Auth pages (login, setup-account) and preview pages don't get the sidebar
  const isAuthPage = pathname.includes("/admin/login") || pathname.includes("/admin/setup-account")
  const isPreviewPage = pathname.includes("/admin/preview/")

  if (isAuthPage || isPreviewPage) {
    return (
      <div className="flex min-h-dvh flex-col bg-slate-950">
        {children}
      </div>
    )
  }

  return (
    <div className="flex h-dvh w-full bg-slate-950">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex">
        <AdminSidebar user={user} pathname={pathname} />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Top Bar */}
        <div className="flex lg:hidden items-center gap-4 border-b border-white/10 bg-white/5 backdrop-blur-xl h-16 px-4">
          <AdminSidebarMobile user={user} pathname={pathname} />
          <span className="text-sm font-bold text-white">
            {t("title")}
          </span>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export { AdminShell }
