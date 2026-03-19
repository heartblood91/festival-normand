"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Facebook, Instagram, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NAV_ITEMS, CTA_HREF, SOCIAL_LINKS } from "@/lib/navigation"
import { isNavActive } from "@/lib/utils/nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { SparkleIcon } from "@/components/ui/sparkle-icon"
import { ContrastToggle } from "@/components/layout/contrast-toggle"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { useState } from "react"

const Header = () => {
  const pathname = usePathname()
  const t = useTranslations()
  const [mobileOpen, setMobileOpen] = useState(false)
  const locale = pathname.split("/")[1]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
        {/* Logo */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2 text-lg font-serif font-bold text-foreground transition-colors hover:text-primary md:text-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
          aria-label={`${t("meta.festivalName")} - ${t("a11y.backToHome")}`}
        >
          <SparkleIcon className="size-5" />
          <span>{t("meta.festivalName")}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("a11y.mainNav")}>
          {NAV_ITEMS.map((item) => {
            const fullHref = `/${locale}${item.href}`
            const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/"
            const isActive = isNavActive(item.href, pathWithoutLocale)
            return (
              <Link
                key={item.href}
                href={fullHref}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {t(`nav.${item.key}`)}
              </Link>
            )
          })}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-1">
            <LocaleSwitcher />
            <ContrastToggle />
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Facebook"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </a>
          </div>

          <Button asChild size="lg">
            <Link href={`/${locale}${CTA_HREF}`}>
              {t("nav.register")}
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label={t("a11y.openMenu")}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          <Menu className="size-5" />
        </Button>
      </div>

      {/* Mobile Navigation */}
      <MobileNav
        open={mobileOpen}
        onOpenChange={setMobileOpen}
        pathname={pathname}
      />
    </header>
  )
}

export { Header }
