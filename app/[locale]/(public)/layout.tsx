import { setRequestLocale } from "next-intl/server"
import { SkipNav } from "@/components/layout/skip-nav"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

type PublicLayoutProps = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

const PublicLayout = async ({ children, params }: PublicLayoutProps) => {
  const { locale } = await params
  // Layouts render in parallel with pages: each one must seed the request locale,
  // otherwise next-intl falls back to headers() and breaks on-demand ISR.
  setRequestLocale(locale)

  return (
    <>
      <SkipNav />
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  )
}

export default PublicLayout
