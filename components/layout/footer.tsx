import Link from "next/link"
import { getTranslations, getLocale } from "next-intl/server"
import { Facebook, Instagram } from "lucide-react"
import { NAV_ITEMS, SOCIAL_LINKS } from "@/lib/navigation"
import { SparkleIcon } from "@/components/ui/sparkle-icon"

const Footer = async () => {
  const t = await getTranslations()
  const locale = await getLocale()
  const year = new Date().getFullYear()
  return (
    <footer className="bg-background/50 border-t border-white/10" role="contentinfo">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-10 md:grid-cols-3">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link
              href={`/${locale}`}
              className="text-foreground hover:text-primary focus-visible:ring-primary/50 inline-flex items-center gap-2 rounded-sm font-serif text-lg font-bold transition-colors focus-visible:ring-2 focus-visible:outline-none"
              aria-label={`${t("meta.festivalName")} - ${t("a11y.backToHome")}`}
            >
              <SparkleIcon className="size-5" />
              <span>{t("meta.festivalName")}</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              {t("footer.description")}
              <br />
              {t("meta.festivalDates")}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <a
                href={SOCIAL_LINKS.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary focus-visible:ring-primary/50 inline-flex size-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:outline-none"
                aria-label="Facebook"
              >
                <Facebook className="size-5" />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary focus-visible:ring-primary/50 inline-flex size-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:outline-none"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h2 className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
              {t("footer.navigation")}
            </h2>
            <nav id="footer-nav" aria-label={t("a11y.footerNav")}>
              <ul className="flex flex-col gap-2">
                {NAV_ITEMS.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={`/${locale}${item.href}`}
                      className="text-muted-foreground hover:text-primary focus-visible:ring-primary/50 rounded-sm text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                    >
                      {t(`nav.${item.key}`)}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={`/${locale}/mentions-legales`}
                    className="text-muted-foreground hover:text-primary focus-visible:ring-primary/50 rounded-sm text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {t("nav.legalNotice")}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/accessibilite`}
                    className="text-muted-foreground hover:text-primary focus-visible:ring-primary/50 rounded-sm text-sm transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    {t("nav.accessibility")}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h2 className="text-foreground mb-4 text-sm font-semibold tracking-wider uppercase">
              {t("footer.contact")}
            </h2>
            <p className="text-muted-foreground text-sm">{t("footer.contactQuestion")}</p>
            <Link
              href={`/${locale}/contact`}
              className="text-primary hover:text-primary/80 focus-visible:ring-primary/50 mt-3 inline-flex items-center gap-1 rounded-sm text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:outline-none"
            >
              {t("footer.contactCta")}
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-white/10 pt-8 text-center">
          <p className="text-muted-foreground text-xs">{t("footer.copyright", { year })}</p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
