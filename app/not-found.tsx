import Link from "next/link"
import { Home, CalendarDays } from "lucide-react"

export const metadata = { title: "Page introuvable" }

const NotFound = () => {
  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-4 bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text font-serif text-8xl font-bold text-transparent">
            404
          </div>
          <h1 className="text-foreground mb-2 font-serif text-3xl font-bold md:text-4xl">
            Page introuvable
          </h1>
          <p className="text-muted-foreground mb-8 text-base md:text-lg">
            Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/fr"
            className="text-foreground focus-visible:ring-primary/50 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-6 py-3 font-medium backdrop-blur-xl transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:outline-none"
          >
            <Home className="size-5" aria-hidden="true" />
            Retour à l&apos;accueil
          </Link>

          <Link
            href="/fr/evenements"
            className="text-primary focus-visible:ring-primary/50 flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-6 py-3 font-medium backdrop-blur-xl transition-colors hover:bg-amber-500/20 focus-visible:ring-2 focus-visible:outline-none"
          >
            <CalendarDays className="size-5" aria-hidden="true" />
            Voir les événements
          </Link>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-muted-foreground text-xs">Erreur 404 — Page non trouvée</p>
        </div>
      </div>
    </div>
  )
}

export default NotFound
