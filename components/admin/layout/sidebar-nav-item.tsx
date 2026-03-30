"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type SidebarNavItemProps = {
  href: string
  icon: LucideIcon
  label: string
  pathname: string
}

const SidebarNavItem = ({
  href,
  icon: Icon,
  label,
  pathname,
}: SidebarNavItemProps) => {
  // Dashboard: exact match only. Others: startsWith but must match the full segment
  const isDashboard = href.endsWith("/admin")
  const isActive = isDashboard ? pathname === href : pathname.startsWith(href + "/") || pathname === href

  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-11 items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50",
        isActive
          ? "border-l-2 border-amber-500 bg-amber-500/10 text-amber-500"
          : "border-l-2 border-transparent text-slate-400 hover:bg-white/5"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon className="size-4 flex-shrink-0" />
      <span>{label}</span>
    </Link>
  )
}

export { SidebarNavItem }
