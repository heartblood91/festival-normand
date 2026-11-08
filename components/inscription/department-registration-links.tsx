import { getLocale, getTranslations } from "next-intl/server"
import { ArrowUpRight } from "lucide-react"
import type { Locale } from "@/lib/i18n/config"
import { getRegistrationLinks } from "@/lib/queries/registration-links"
import { departmentByEnum, departmentName } from "@/lib/festival/departments"
import { departmentRegistrations } from "@/lib/festival/registration"

// Registration is editorial: each Norman department points to its own form
// (Tourinsoft questionnaire-web, or the department's own site for Calvados).
// URLs are managed in the admin; all five departments always get a card.
export const DepartmentRegistrationLinks = async () => {
  const t = await getTranslations("registration")
  const locale = (await getLocale()) as Locale
  const departments = departmentRegistrations(await getRegistrationLinks())

  return (
    <section className="mb-14 scroll-mt-28" aria-labelledby="registration-links-heading">
      <h2
        id="registration-links-heading"
        className="text-foreground font-display scroll-mt-28 text-3xl font-normal tracking-tight italic md:text-4xl"
      >
        {t("byDepartmentTitle")}
      </h2>
      <p className="text-ed-mute mt-2 font-sans text-sm">{t("byDepartmentIntro")}</p>

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {departments.map(({ department, code, url }) => {
          const meta = departmentByEnum(department)
          const name = meta ? departmentName(meta, locale) : department
          const body = (
            <>
              <span
                className="text-primary font-display text-4xl leading-none font-normal italic"
                aria-hidden="true"
              >
                {code}
              </span>
              <span className="min-w-0 flex-1">
                <span className="text-foreground block font-serif text-xl leading-tight">
                  {name}
                  <span className="sr-only"> — {t("departmentNumber", { code })}</span>
                </span>
                <span
                  className={
                    url
                      ? "text-primary mt-1 inline-flex items-center gap-1 font-sans text-xs font-semibold tracking-[0.14em] uppercase"
                      : "text-ed-mute mt-1 block font-sans text-xs tracking-[0.14em] uppercase"
                  }
                >
                  {url ? t("cta") : t("comingSoon")}
                  {url ? <ArrowUpRight className="size-3.5" aria-hidden="true" /> : null}
                </span>
              </span>
            </>
          )

          return (
            <li key={department}>
              {url ? (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group border-primary/30 bg-ed-bg-deep hover:border-primary hover:bg-primary/5 focus-visible:ring-primary/50 flex min-h-20 items-center gap-4 border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                >
                  {body}
                  <span className="sr-only">{t("newTab")}</span>
                </a>
              ) : (
                <div className="border-primary/15 flex min-h-20 items-center gap-4 border border-dashed p-4 opacity-80">
                  {body}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
