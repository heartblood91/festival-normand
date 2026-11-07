import { Link } from "@/lib/i18n/routing"
import { getTranslations } from "next-intl/server"
import { Facebook, Instagram } from "lucide-react"
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/navigation"
import { CookiePreferencesFooterItem } from "@/components/cookies/cookie-preferences-footer-item"
import { LanternLogo } from "@/components/editorial/lantern-logo"

type FooterProps = {
  editionDates: string
}

const Footer = async ({ editionDates }: FooterProps) => {
  const t = await getTranslations()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-ed-bg-deep border-primary/25 border-t" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-foreground hover:text-primary focus-visible:ring-primary/50 inline-flex items-center gap-3 rounded-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
              aria-label={`${t("meta.festivalName")} — ${t("a11y.backToHome")}`}
            >
              <LanternLogo className="size-7" />
              <span className="font-display text-xl font-medium italic">
                {t("meta.festivalName")}
              </span>
            </Link>
            <p className="text-ed-bone max-w-sm font-serif text-base font-light opacity-75">
              {t("footer.description")} {editionDates}.
            </p>
            <div className="mt-1 flex items-center gap-2">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ed-bone hover:text-primary hover:border-primary/50 focus-visible:ring-primary/50 border-primary/25 inline-flex size-11 items-center justify-center border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                aria-label="Facebook"
              >
                <Facebook className="size-5" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ed-bone hover:text-primary hover:border-primary/50 focus-visible:ring-primary/50 border-primary/25 inline-flex size-11 items-center justify-center border transition-colors focus-visible:ring-2 focus-visible:outline-none"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h2 className="text-primary mb-4 font-mono text-[10px] tracking-[0.2em] uppercase">
              {t("footer.navigation")}
            </h2>
            <nav id="footer-nav" aria-label={t("a11y.footerNav")}>
              <ul className="flex flex-col gap-2.5">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-ed-bone hover:text-primary focus-visible:ring-primary/50 rounded-sm font-sans text-sm opacity-80 transition-colors hover:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href="/mentions-legales"
                    className="text-ed-bone hover:text-primary focus-visible:ring-primary/50 rounded-sm font-sans text-sm opacity-80 transition-colors hover:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {t("nav.legalNotice")}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accessibilite"
                    className="text-ed-bone hover:text-primary focus-visible:ring-primary/50 rounded-sm font-sans text-sm opacity-80 transition-colors hover:opacity-100 focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {t("nav.accessibility")}
                  </Link>
                </li>
                <CookiePreferencesFooterItem />
              </ul>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-primary mb-4 font-mono text-[10px] tracking-[0.2em] uppercase">
              {t("footer.contact")}
            </h2>
            <p className="text-ed-bone font-serif text-base font-light opacity-80">
              {t("footer.contactQuestion")}
            </p>
            <Link
              href="/contact"
              className="text-primary hover:text-ed-amber-soft focus-visible:ring-primary/50 border-primary mt-3 inline-flex items-center gap-1 rounded-sm border-b pb-1 font-sans text-xs font-medium tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("footer.contactCta")}
            </Link>
          </div>
        </div>

        <div className="border-primary/20 mt-12 flex flex-col gap-3 border-t pt-7 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-ed-bone font-mono text-[10px] tracking-[0.14em] uppercase opacity-80">
            {t("footer.copyright", { year })}
          </p>
          <p className="text-ed-bone font-mono text-[10px] tracking-[0.14em] uppercase opacity-80">
            Départements de Normandie &amp; Fondation du Patrimoine
          </p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
