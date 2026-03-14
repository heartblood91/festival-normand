"use client"

import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { NAV_ITEMS, CTA_LINK, SOCIAL_LINKS, FESTIVAL_NAME } from "@/lib/navigation"
import { SparkleIcon } from "@/components/ui/sparkle-icon"

type MobileNavProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  pathname: string
}

const MobileNav = ({ open, onOpenChange, pathname }: MobileNavProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full border-white/10 bg-background/95 backdrop-blur-xl sm:max-w-sm"
        id="mobile-nav"
      >
        <SheetHeader className="border-b border-white/10 pb-4">
          <SheetTitle className="font-serif text-lg text-foreground">
            <SparkleIcon className="size-5 inline-block" /> {FESTIVAL_NAME}
          </SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col gap-1 p-4" aria-label="Navigation mobile">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onOpenChange(false)}
              className={cn(
                "rounded-lg px-4 py-3 text-base font-medium transition-colors hover:bg-white/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                pathname === item.href
                  ? "bg-white/5 text-primary"
                  : "text-muted-foreground"
              )}
              aria-current={pathname === item.href ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-4 border-t border-white/10 p-4">
          <Button asChild size="lg" className="w-full">
            <Link href={CTA_LINK.href} onClick={() => onOpenChange(false)}>
              {CTA_LINK.label}
            </Link>
          </Button>

          <div className="flex items-center justify-center gap-2">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              aria-label="Facebook"
            >
              <Facebook className="size-5" />
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-white/5 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
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
