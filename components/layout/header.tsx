"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { Link } from "@/lib/i18n/routing"
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
    <header className="bg-background/80 sticky top-0 z-50 w-full border-b border-white/10 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="text-foreground hover:text-primary focus-visible:ring-primary/50 flex items-center gap-2 rounded-sm font-serif text-lg font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none md:text-xl"
          aria-label={`${t("meta.festivalName")} - ${t("a11y.backToHome")}`}
        >
          <SparkleIcon className="size-5" />
          <span>{t("meta.festivalName")}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label={t("a11y.mainNav")}>
          {NAV_ITEMS.map((item) => {
            const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/"
            const isActive = isNavActive(item.href, pathWithoutLocale)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:text-primary focus-visible:ring-primary/50 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none",
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
              className="text-muted-foreground hover:text-primary focus-visible:ring-primary/50 inline-flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Facebook"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary focus-visible:ring-primary/50 inline-flex size-9 items-center justify-center rounded-lg transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Instagram"
            >
              <Instagram className="size-4" />
            </a>
          </div>

          <Button asChild size="lg">
            <Link href={CTA_HREF}>{t("nav.register")}</Link>
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
      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} pathname={pathname} />
    </header>
  )
}

export { Header }
