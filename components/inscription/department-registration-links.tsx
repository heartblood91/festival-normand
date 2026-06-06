import { getTranslations } from "next-intl/server"
import { ExternalLink } from "lucide-react"
import { getRegistrationLinks } from "@/lib/queries/registration-links"

// Registration is editorial: each Norman department points to its own form
// (Tourinsoft questionnaire-web, or the department's own site for Calvados).
// URLs are managed in the admin and rendered here as on-brand cards.
export const DepartmentRegistrationLinks = async () => {
  const t = await getTranslations()
  const links = (await getRegistrationLinks()).filter((link) => link.url.trim().length > 0)

  if (links.length === 0) return null

  return (
    <section className="mt-12" aria-labelledby="registration-links-heading">
      <h2
        id="registration-links-heading"
        className="text-foreground mb-2 font-serif text-xl font-bold md:text-2xl"
      >
        {t("registration.byDepartmentTitle")}
      </h2>
      <p className="text-muted-foreground mb-6 text-sm">{t("registration.byDepartmentIntro")}</p>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group hover:border-primary/40 focus-visible:ring-primary/50 flex min-h-16 items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:bg-white/10 focus-visible:ring-2 focus-visible:outline-none"
            >
              <span className="text-foreground font-medium">{t(`departments.${link.department}`)}</span>
              <span className="text-primary inline-flex items-center gap-1.5 text-sm font-medium">
                {t("registration.cta")}
                <ExternalLink className="size-4" aria-hidden="true" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
