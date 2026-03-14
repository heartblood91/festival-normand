import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"
import { NAV_ITEMS, SOCIAL_LINKS, FESTIVAL_NAME, FESTIVAL_DATES } from "@/lib/navigation"
import { SparkleIcon } from "@/components/ui/sparkle-icon"

const PARTNERS = [
  { name: "Région Normandie", logo: "normandie.png", alt: "Région Normandie" },
  { name: "Fondation du Patrimoine", logo: "fondation-patrimoine.png", alt: "Fondation du Patrimoine" },
  { name: "Calvados", logo: "calvados.png", alt: "Calvados" },
  { name: "Eure", logo: "eure.png", alt: "Eure" },
  { name: "Manche", logo: "manche.png", alt: "Manche" },
  { name: "Orne", logo: "orne.png", alt: "Orne" },
  { name: "Seine-Maritime", logo: "seine-maritime.png", alt: "Seine-Maritime" },
]

const Footer = () => {
  return (
    <footer className="border-t border-white/10 bg-background/50" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        {/* Top Section */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 font-serif text-lg font-bold text-foreground transition-colors hover:text-primary"
              aria-label={`${FESTIVAL_NAME} - Retour à l'accueil`}
            >
              <SparkleIcon className="size-5" />
              <span>{FESTIVAL_NAME}</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Découvrez la magie du patrimoine normand en nocturne.
              <br />
              {FESTIVAL_DATES}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Navigation
            </h2>
            <nav aria-label="Navigation du pied de page">
              <ul className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/mentions-legales"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary"
                  >
                    Mentions légales
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Partners */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Événement créé par
            </h2>
            <div className="flex flex-col gap-3">
              {PARTNERS.map(({ name, logo, alt }) => (
                <div
                  key={name}
                  className="grayscale transition-all duration-300 hover:grayscale-0"
                >
                  <img
                    src={`/images/partners/${logo}`}
                    alt={alt}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social + Contact */}
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
              Suivez-nous
            </h2>
            <div className="flex items-center gap-2">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Facebook"
              >
                <Facebook className="size-5" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {FESTIVAL_NAME}. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
