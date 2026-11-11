import { setRequestLocale } from "next-intl/server"
import { SkipNav } from "@/components/layout/skip-nav"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { editionDateRange, editionKicker, getEditionMode } from "@/lib/festival/edition"
import { getCurrentEdition } from "@/lib/queries/edition"
import type { Locale } from "@/lib/i18n/config"

type PublicLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const PublicLayout = async ({ children, params }: PublicLayoutProps) => {
  const { locale } = (await params) as { locale: Locale }
  // Layouts render in parallel with pages: each one must seed the request locale,
  // otherwise next-intl falls back to headers() and breaks on-demand ISR.
  setRequestLocale(locale)
  const edition = await getCurrentEdition()
  const mode = getEditionMode(edition)

  return (
    <div className="editorial bg-background text-foreground flex min-h-dvh flex-col font-serif">
      <SkipNav />
      <Header kicker={editionKicker(edition, mode, locale)} />
      {/* tabIndex lets the skip link move focus, not only the scroll position */}
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <Footer editionDates={editionDateRange(edition, locale)} />
    </div>
  )
}

export default PublicLayout
