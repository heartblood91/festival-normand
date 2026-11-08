"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { Menu, X } from "lucide-react"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar"

type AdminSidebarMobileProps = {
  user: {
    name: string
    email: string
    role: string
  }
  pathname: string
}

const TOUCH_TARGET =
  "inline-flex size-11 shrink-0 items-center justify-center rounded-lg text-foreground hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:outline-none"

/** Same navigation as the desktop sidebar, in a drawer that closes on navigation. */
const AdminSidebarMobile = ({ user, pathname }: AdminSidebarMobileProps) => {
  const [open, setOpen] = useState(false)
  const t = useTranslations("admin")
  const tA11y = useTranslations("a11y")

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className={TOUCH_TARGET} aria-label={tA11y("openMenu")}>
        <Menu className="size-5" aria-hidden="true" />
      </SheetTrigger>

      <SheetContent side="left" className="w-72 gap-0 p-0" showCloseButton={false}>
        <SheetTitle className="sr-only">{t("title")}</SheetTitle>
        <AdminSidebar
          user={user}
          pathname={pathname}
          onNavigate={() => setOpen(false)}
          className="h-full w-full border-r-0"
          headerAction={
            <SheetPrimitive.Close className={TOUCH_TARGET} aria-label={tA11y("closeMenu")}>
              <X className="size-5" aria-hidden="true" />
            </SheetPrimitive.Close>
          }
        />
      </SheetContent>
    </Sheet>
  )
}

export { AdminSidebarMobile }
