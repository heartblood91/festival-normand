import { getTranslations } from "next-intl/server"
import { requireRole } from "@/lib/rbac"
import { Link } from "@/lib/i18n/routing"
import { prisma } from "@/lib/prisma"
import { getSiteStats } from "@/lib/admin/stats"
import { parisToday } from "@/lib/admin/event-list"
import {
  AUDIENCE_DAYS,
  fillDays,
  getAudienceStats,
  isPostHogStatsConfigured,
} from "@/lib/analytics/posthog-stats"
import { BarList, DailyColumns, StatTile } from "@/components/admin/stats/stat-charts"

export const metadata = {
  title: "Statistiques - Administration",
  robots: { index: false, follow: false },
}

const numberFormat = new Intl.NumberFormat("fr-FR")
const dayFormat = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

const percent = (part: number, total: number) =>
  total > 0 ? `${Math.round((part / total) * 100)} %` : "—"

const todoLink =
  "inline-flex min-h-11 items-center rounded-sm text-amber-400 underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:outline-none"

const EVENT_PATH = /^\/(fr|en)\/evenement\/([\w-]+)\/?$/

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-xl border border-white/10 bg-white/5 p-4 md:p-6">
    <h2 className="mb-4 font-serif text-lg font-bold text-white">{title}</h2>
    {children}
  </section>
)

const AdminStatsRoute = async () => {
  await requireRole("EDITOR")
  const t = await getTranslations()
  const [site, audience] = await Promise.all([getSiteStats(), getAudienceStats()])
  const configured = isPostHogStatsConfigured()

  // Event pages read better with their title than with their slug.
  const slugs = (audience?.topPages ?? []).flatMap((page) => {
    const match = EVENT_PATH.exec(page.path)
    return match ? [match[2]] : []
  })
  const titles = new Map(
    slugs.length > 0
      ? (
          await prisma.event.findMany({
            where: { slug: { in: slugs } },
            select: { slug: true, titleFr: true },
          })
        ).map((event) => [event.slug, event.titleFr])
      : []
  )
  const pageLabel = (path: string) => {
    const slug = EVENT_PATH.exec(path)?.[2]
    return (slug && titles.get(slug)) || path || "(inconnue)"
  }

  const days = audience
    ? fillDays(audience.daily, parisToday().toISOString().slice(0, 10)).map((day) => ({
        ...day,
        label: dayFormat.format(new Date(`${day.day}T12:00:00Z`)),
      }))
    : []
  const { completeness } = site

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-amber-500">Statistiques</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Les sites comptés sont ceux visibles sur le site public aujourd&apos;hui.
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Sites en ligne" value={numberFormat.format(site.total)} />
        <StatTile
          label="Avis publiés"
          value={numberFormat.format(site.reviews.published)}
          detail={
            site.reviews.average !== null
              ? `Note moyenne ${site.reviews.average.toFixed(1).replace(".", ",")} sur 5`
              : undefined
          }
        />
        <StatTile label="Avis à modérer" value={numberFormat.format(site.reviews.pending)} />
        <StatTile
          label="Réponses aux questionnaires"
          value={numberFormat.format(
            site.surveys.reduce((sum, survey) => sum + survey.responses, 0)
          )}
        />
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Sites par département">
          <BarList
            rows={site.byDepartment.map((row) => ({
              label: t(`departments.${row.key}`),
              value: row.count,
            }))}
          />
        </Section>
        <Section title="Sites par type d'animation">
          <BarList
            rows={site.byCategory.map((row) => ({
              label: t(`categories.${row.key}`),
              value: row.count,
            }))}
          />
        </Section>
      </div>

      <Section title="Qualité des fiches">
        <BarList
          max={site.total}
          formatValue={(value) => percent(value, site.total)}
          rows={[
            { label: "Avec une photo", value: completeness.withPhoto },
            { label: "Traduites en anglais", value: completeness.withEnglish },
            { label: "Placées sur la carte", value: completeness.withGps },
            { label: "Avec réseaux ou associations", value: completeness.withCommunity },
          ].map((row) => ({ ...row, detail: `(${row.value})` }))}
        />
        <ul className="mt-4 flex flex-wrap gap-x-6 text-sm">
          <li>
            <Link href="/admin/events?todo=missing-en" className={todoLink}>
              Fiches à traduire
            </Link>
          </li>
          <li>
            <Link href="/admin/events?todo=missing-gps" className={todoLink}>
              Fiches sans position sur la carte
            </Link>
          </li>
        </ul>
      </Section>

      <Section title={`Audience des ${AUDIENCE_DAYS} derniers jours`}>
        {audience ? (
          <div className="grid gap-6">
            <dl className="grid grid-cols-2 gap-3">
              <StatTile label="Pages vues" value={numberFormat.format(audience.pageviews)} />
              <StatTile label="Visiteurs" value={numberFormat.format(audience.visitors)} />
            </dl>
            <DailyColumns
              caption="Pages vues par jour (heure de Paris)."
              tableSummary={`Pages vues par jour sur les ${AUDIENCE_DAYS} derniers jours`}
              days={days}
            />
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 font-medium text-white">Pages les plus vues</h3>
                {audience.topPages.length > 0 ? (
                  <BarList
                    rows={audience.topPages.map((page) => ({
                      label: pageLabel(page.path),
                      value: page.views,
                    }))}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">Aucune visite enregistrée.</p>
                )}
              </div>
              <div>
                <h3 className="mb-3 font-medium text-white">Provenance des visites</h3>
                {audience.referrers.length > 0 ? (
                  <BarList
                    rows={audience.referrers.map((referrer) => ({
                      label:
                        !referrer.domain || referrer.domain === "$direct"
                          ? "Accès direct"
                          : referrer.domain,
                      value: referrer.views,
                    }))}
                  />
                ) : (
                  <p className="text-muted-foreground text-sm">Aucune visite enregistrée.</p>
                )}
              </div>
            </div>
            <p className="text-muted-foreground text-xs">
              Seuls les visiteurs ayant accepté les cookies de mesure d&apos;audience sont comptés ;
              les chiffres réels sont donc plus élevés. Données mises à jour toutes les heures.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm" role="status">
            {configured
              ? "PostHog ne répond pas pour le moment. Réessayez plus tard."
              : "Mesure d'audience non configurée : ajoutez POSTHOG_PERSONAL_API_KEY (clé personnelle en lecture) et POSTHOG_PROJECT_ID dans les variables d'environnement du serveur."}
          </p>
        )}
      </Section>

      {site.surveys.length > 0 ? (
        <Section title="Questionnaires">
          <BarList
            rows={site.surveys.map((survey) => ({
              label: survey.published ? survey.title : `${survey.title} (brouillon)`,
              value: survey.responses,
            }))}
            formatValue={(value) => `${value} réponse${value > 1 ? "s" : ""}`}
          />
        </Section>
      ) : null}
    </div>
  )
}

export default AdminStatsRoute
