import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { Facebook, Instagram } from "lucide-react"
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/navigation"
import { SparkleIcon } from "@/components/ui/sparkle-icon"

const Footer = async () => {
  const t = await getTranslations()
  const year = new Date().getFullYear()
  return (
  <footer className="border-t border-white/10 bg-background/50" role="contentinfo">
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
      <div className="grid gap-10 md:grid-cols-3">
        {/* Brand */}
        <div className="flex flex-col gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-serif text-lg font-bold text-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
            aria-label={`${t("meta.festivalName")} - ${t("a11y.backToHome")}`}
          >
            <SparkleIcon className="size-5" />
            <span>{t("meta.festivalName")}</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            {t("footer.description")}
            <br />
            {t("meta.festivalDates")}
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
            {t("footer.navigation")}
          </h2>
          <nav id="footer-nav" aria-label={t("a11y.footerNav")}>
            <ul className="flex flex-col gap-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                  >
                    {t(`nav.${item.key}`)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                >
                  {t("nav.legalNotice")}
                </Link>
              </li>
              <li>
                <Link
                  href="/accessibilite"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
                >
                  {t("nav.accessibility")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Contact */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-foreground">
            {t("footer.contact")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("footer.contactQuestion")}
          </p>
          <Link
            href="/contact"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-sm"
          >
            {t("footer.contactCta")}
          </Link>
        </div>
      </div>

      {/* Bottom */}
      <div className="mt-12 border-t border-white/10 pt-8 text-center">
        <p className="text-xs text-muted-foreground">
          {t("footer.copyright", { year })}
        </p>
      </div>
    </div>
      </footer>
    )
}

export { Footer }
