"use client"

import { useLocale, useTranslations } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"

const LocaleSwitcher = () => {
  const locale = useLocale()
  const t = useTranslations("locale")
  const pathname = usePathname()
  const router = useRouter()

  const switchLocale = () => {
    const nextLocale = locale === "fr" ? "en" : "fr"
    const pathWithoutLocale = pathname.replace(/^\/(fr|en)/, "")
    router.push(`/${nextLocale}${pathWithoutLocale}`)
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-2 py-1.5 text-sm font-medium transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
      aria-label={`FR / EN — ${t("switchTo")}`}
    >
      <Globe className="size-3.5 text-primary" aria-hidden="true" />
      <span aria-hidden="true" className={cn(
        "rounded px-1.5 py-0.5 text-xs font-bold transition-colors",
        locale === "fr" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
      )}>FR</span>
      <span aria-hidden="true" className={cn(
        "rounded px-1.5 py-0.5 text-xs font-bold transition-colors",
        locale === "en" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
      )}>EN</span>
    </button>
  )
}

export { LocaleSwitcher }
