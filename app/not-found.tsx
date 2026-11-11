import Link from "next/link"
import { fontVariables } from "@/lib/fonts"

export const metadata = { title: "Page introuvable" }

// Only reached outside a locale segment: localized URLs use app/[locale]/(public)/not-found.tsx.
const NotFound = () => (
  <html lang="fr" dir="ltr" className={fontVariables}>
    <body className="editorial bg-background text-foreground flex min-h-dvh flex-col font-serif antialiased">
      <main className="flex flex-1 items-center justify-center px-4 py-20">
        <div className="max-w-xl text-center">
          <p className="text-primary font-mono text-[11px] tracking-[0.22em] uppercase">
            Erreur 404
          </p>
          <h1 className="text-foreground font-display mt-5 text-5xl font-normal italic md:text-6xl">
            Page introuvable
          </h1>
          <p className="text-ed-bone mt-6 text-xl font-light italic">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/fr"
              className="bg-primary text-primary-foreground focus-visible:ring-ring inline-flex min-h-11 items-center justify-center px-8 py-4 font-sans text-xs font-semibold tracking-[0.14em] uppercase focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/fr/evenements"
              className="border-ed-cream/50 text-foreground hover:text-primary focus-visible:ring-primary/50 inline-flex min-h-11 items-center justify-center border px-8 py-4 font-sans text-xs font-medium tracking-[0.14em] uppercase focus-visible:ring-2 focus-visible:outline-none"
            >
              Voir les événements
            </Link>
          </div>
        </div>
      </main>
    </body>
  </html>
)

export default NotFound
