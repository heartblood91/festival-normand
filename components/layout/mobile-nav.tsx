"use client"

import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { NAV_ITEMS, CTA_HREF, SOCIAL_LINKS } from "@/lib/navigation"
import { isNavActive } from "@/lib/utils/nav"
import { SparkleIcon } from "@/components/ui/sparkle-icon"
import { ContrastToggle } from "@/components/layout/contrast-toggle"
import { LocaleSwitcher } from "@/components/layout/locale-switcher"

type MobileNavProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathname: string
}

const MobileNav = ({ open, onOpenChange, pathname }: MobileNavProps) => {
  const t = useTranslations()
  const locale = useLocale()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="bg-background/95 w-full border-white/10 backdrop-blur-xl sm:max-w-sm"
        id="mobile-nav"
      >
        <SheetHeader className="border-b border-white/10 pb-4">
          <SheetTitle className="text-foreground font-serif text-lg">
            <SparkleIcon className="inline-block size-5" /> {t("meta.festivalName")}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-4" aria-label={t("a11y.mainNav")}>
          {NAV_ITEMS.map((item) => {
            const href = `/${locale}${item.href}`
            const pathWithoutLocale = pathname.replace(`/${locale}`, "") || "/"
            const isActive = isNavActive(item.href, pathWithoutLocale)
            return (
              <Link
                key={item.key}
                href={href}
                onClick={() => onOpenChange(false)}
                className={cn(
                  "hover:text-primary focus-visible:ring-primary/50 rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none",
                  isActive ? "text-primary bg-white/5" : "text-muted-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {t(`nav.${item.key}`)}
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-4 border-t border-white/10 p-4">
          <div className="flex items-center gap-2">
            <ContrastToggle />
            <LocaleSwitcher />
          </div>

          <Button asChild size="lg" className="w-full">
            <Link href={`/${locale}${CTA_HREF}`} onClick={() => onOpenChange(false)}>
              {t("nav.register")}
            </Link>
          </Button>

          <div className="flex items-center justify-center gap-2">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary focus-visible:ring-primary/50 inline-flex size-11 items-center justify-center rounded-lg transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Facebook"
            >
              <Facebook className="size-5" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary focus-visible:ring-primary/50 inline-flex size-11 items-center justify-center rounded-lg transition-colors hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
              aria-label="Instagram"
            >
              <Instagram className="size-5" />
            </a>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export { MobileNav }
