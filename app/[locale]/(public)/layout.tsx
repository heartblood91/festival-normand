import { SkipNav } from "@/components/layout/skip-nav"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
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
