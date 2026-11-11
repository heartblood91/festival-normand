"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useTranslations, useLocale } from "next-intl"
import { Link } from "@/lib/i18n/routing"
import { Facebook, Instagram, Menu, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { NAV_ITEMS, CTA_HREF, SOCIAL_LINKS } from "@/lib/navigation"
import { isNavActive } from "@/lib/utils/nav"
import { MobileNav } from "@/components/layout/mobile-nav"
import { ContrastToggle } from "@/components/layout/contrast-toggle"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"
import { LanternLogo } from "@/components/editorial/lantern-logo"
import { TravelBookLink } from "@/components/travel-book/travel-book-link"

const HeaderSearch = () => {
  const t = useTranslations()
  const locale = useLocale()
  const router = useRouter()
  const [value, setValue] = useState("")

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = value.trim()
    router.push(`/${locale}/evenements${query ? `?search=${encodeURIComponent(query)}` : ""}`)
  }

  return (
    <form
      onSubmit={submit}
      role="search"
      className="border-primary/30 focus-within:border-primary flex items-center gap-2 border px-3 py-1.5 transition-colors"
    >
      <Search className="text-ed-bone size-3" aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t("editorial.searchPlaceholder")}
        aria-label={t("search.ariaLabel")}
        className="text-ed-bone placeholder:text-ed-bone/50 w-44 bg-transparent font-serif text-sm italic outline-none xl:w-56"
      />
    </form>
  )
}

type HeaderProps = {
  /** Edition kicker under the logo, e.g. "18ᵉ édition · 21 — 23 mai 2027" */
  kicker: string
}

const Header = ({ kicker }: HeaderProps) => {
  const pathname = usePathname()
  const t = useTranslations()
  const [mobileOpen, setMobileOpen] = useState(false)
  const localePrefix = pathname.split("/")[1]

  return (
    <header className="border-primary/25 bg-ed-bg-deep/85 sticky top-0 z-50 w-full border-b backdrop-blur-xl print:hidden">
      {/* Utility strip — contrast, language, city search, social */}
      <div className="border-primary/15 hidden border-b md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-2">
          <div className="flex items-center gap-3">
            <ContrastToggle />
            <LocaleSwitcher />
          </div>
          <div className="flex items-center gap-4">
            <HeaderSearch />
            <span className="bg-primary/30 h-4 w-px" aria-hidden="true" />
            <div className="flex items-center gap-1">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ed-bone hover:text-primary focus-visible:ring-primary/50 inline-flex size-8 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                aria-label={`Facebook ${t("a11y.newTab")}`}
              >
                <Facebook className="size-4" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ed-bone hover:text-primary focus-visible:ring-primary/50 inline-flex size-8 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                aria-label={`Instagram ${t("a11y.newTab")}`}
              >
                <Instagram className="size-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main bar — logo, nav, CTA */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 md:px-6">
        <Link
          href="/"
          className="focus-visible:ring-primary/50 group flex items-center gap-3 rounded-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          <LanternLogo className="size-7 shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="text-foreground font-display group-hover:text-primary text-lg font-medium transition-colors md:text-xl">
              {t("meta.festivalName")}
              <span className="sr-only"> — {t("a11y.backToHome")}</span>
            </span>
            <span
              className="text-primary mt-1 hidden font-mono text-xs tracking-[0.2em] uppercase sm:block"
              aria-hidden="true"
            >
              {kicker}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label={t("a11y.mainNav")}>
          {NAV_ITEMS.map((item) => {
            const pathWithoutLocale = pathname.replace(`/${localePrefix}`, "") || "/"
            const isActive = isNavActive(item.href, pathWithoutLocale)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:text-primary focus-visible:ring-primary/50 rounded-sm border-b py-1 font-sans text-xs font-medium tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none",
                  isActive ? "text-primary border-primary" : "text-foreground border-transparent"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {t(`nav.${item.key}`)}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <TravelBookLink active={/^\/[a-z]{2}\/carnet(\/|$)/.test(pathname)} />
          <Link
            href={CTA_HREF}
            className="bg-primary text-primary-foreground hover:bg-ed-amber-deep focus-visible:ring-ring hidden items-center px-5 py-3 font-sans text-xs font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none lg:inline-flex"
          >
            {t("nav.register")}
          </Link>

          <button
            type="button"
            className="text-foreground hover:text-primary focus-visible:ring-primary/50 inline-flex size-11 items-center justify-center rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none lg:hidden"
            onClick={() => setMobileOpen(true)}
            aria-label={t("a11y.openMenu")}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} pathname={pathname} />
    </header>
  )
}

export { Header }
