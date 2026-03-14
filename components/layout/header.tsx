"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Facebook, Instagram, Menu } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { NAV_ITEMS, CTA_LINK, SOCIAL_LINKS, FESTIVAL_NAME } from "@/lib/navigation"
import { MobileNav } from "@/components/layout/mobile-nav"
import { SparkleIcon } from "@/components/ui/sparkle-icon"
import { useState } from "react"

const Header = () => {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:h-20 md:px-6">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-serif font-bold text-foreground transition-colors hover:text-primary md:text-xl"
          aria-label={`${FESTIVAL_NAME} - Retour à l'accueil`}
        >
          <SparkleIcon className="size-5" />
          <span>{FESTIVAL_NAME}</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-1">
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
            <Link href={CTA_LINK.href}>
              {CTA_LINK.label}
            </Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileOpen(true)}
          aria-label="Ouvrir le menu"
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
