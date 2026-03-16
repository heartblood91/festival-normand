import Link from "next/link"
import { Facebook, Instagram } from "lucide-react"
import { NAV_ITEMS, SOCIAL_LINKS, FESTIVAL_NAME, FESTIVAL_DATES } from "@/lib/navigation"
import { SparkleIcon } from "@/components/ui/sparkle-icon"

const Footer = () => (
  <footer className="border-t border-white/10 bg-background/50" role="contentinfo">
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
      <div className="grid gap-10 md:grid-cols-3">
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
          <div className="mt-2 flex items-center gap-2">
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

        {/* Contact */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
            Contact
          </h2>
          <p className="text-sm text-muted-foreground">
            Une question sur le festival ?
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:underline"
          >
            Nous contacter →
          </Link>
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

export { Footer }
