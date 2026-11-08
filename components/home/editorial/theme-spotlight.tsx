import { getTranslations, getLocale } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import type { Locale } from "@/lib/i18n/config"
import type { HomeTheme } from "@/lib/queries/themes"
import { formatEventDate } from "@/lib/utils/format-date"
import { SectionHeading } from "@/components/editorial/primitives"

type ThemeSpotlightProps = {
  theme: HomeTheme
  year: number
  markerIndex: string
}

// Home section of a theme flagged "show on home" (e.g. the 2027 Millennium).
const ThemeSpotlight = async ({ theme, year, markerIndex }: ThemeSpotlightProps) => {
  const t = await getTranslations()
  const locale = (await getLocale()) as Locale
  const href = `/evenements?theme=${theme.slug}`

  return (
    <section
      aria-labelledby={`theme-${theme.slug}`}
      className="bg-ed-bg-soft border-primary/25 border-t px-4 py-20 md:px-6 md:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          markerIndex={markerIndex}
          marker={t("editorial.theme.marker", { year })}
          title={<span id={`theme-${theme.slug}`}>{theme.name}</span>}
          lede={theme.description || undefined}
          action={
            theme.events.length > 0 ? (
              <Link
                href={href}
                className="text-primary hover:text-ed-amber-soft focus-visible:ring-primary/50 border-primary inline-flex min-h-11 items-center rounded-sm border-b pb-1 font-sans text-xs tracking-[0.16em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none"
              >
                {t("editorial.theme.viewAll")}
              </Link>
            ) : null
          }
        />

        <div className="grid gap-8 md:grid-cols-[160px_1fr] md:items-start">
          {theme.markerImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={theme.markerImage}
              alt=""
              width={128}
              height={160}
              className="mx-auto h-32 w-auto md:h-40"
            />
          ) : (
            <span
              className="mx-auto block size-16 rounded-full border-4 border-white/80"
              style={{ backgroundColor: theme.color }}
              aria-hidden="true"
            />
          )}

          {theme.events.length > 0 ? (
            <ul className="grid gap-4 md:grid-cols-3">
              {theme.events.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/evenement/${event.slug}`}
                    className="border-primary/20 hover:bg-primary/5 focus-visible:ring-primary/50 block h-full border p-5 transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  >
                    <p className="text-foreground font-display text-xl font-normal">
                      {event.title}
                    </p>
                    <p className="text-ed-bone mt-2 font-serif text-sm italic opacity-85">
                      {event.city} · {formatEventDate(event.dateStart, locale)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ed-bone self-center font-serif text-lg italic">
              {t("editorial.theme.soon")}
            </p>
          )}
        </div>
      </div>
    </section>
  )
}

export { ThemeSpotlight }
