import { getTranslations, getLocale } from "next-intl/server"
import type { Locale } from "@/lib/i18n/config"
import { DEPARTMENTS, departmentName } from "@/lib/festival/departments"
import { Marker } from "@/components/editorial/primitives"
import { NormandyMap } from "@/components/editorial/normandy-map"

type NormandySectionProps = {
  byDepartment: Record<string, number>
  totalPlaces: number
  markerIndex: string
}

const NormandySection = async ({
  byDepartment,
  totalPlaces,
  markerIndex,
}: NormandySectionProps) => {
  const t = await getTranslations()
  const locale = (await getLocale()) as Locale

  const departments = DEPARTMENTS.map((d) => ({
    code: d.code,
    name: departmentName(d, locale),
    count: byDepartment[d.enum] ?? 0,
  }))

  return (
    <section className="bg-ed-bg-deep border-primary/25 border-t px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1fr_380px]">
        <NormandyMap
          departments={departments}
          label={t("editorial.mapSection.mapLabel")}
          className="h-auto w-full"
        />
        <div>
          <Marker index={markerIndex} className="mb-3.5">
            {t("editorial.mapSection.marker")}
          </Marker>
          <h2 className="text-foreground font-display text-3xl leading-tight font-normal tracking-tight italic md:text-4xl">
            {t("editorial.mapSection.title")}
          </h2>
          <p className="text-ed-bone mt-5 font-serif text-lg font-light">
            {t("editorial.mapSection.text", { count: totalPlaces })}
          </p>
          <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-4">
            {departments.map((d) => (
              <div key={d.code} className="border-primary/40 border-t pt-3">
                <dt className="text-primary font-mono text-xs tracking-[0.16em] uppercase">
                  {d.code} · {d.name.toUpperCase()}
                </dt>
                {/* No « 0 lieux » before the department has published places */}
                {d.count > 0 ? (
                  <dd className="text-foreground font-display text-2xl font-normal">
                    {d.count}{" "}
                    <span className="text-ed-mute text-sm italic">
                      {t("editorial.mapSection.places")}
                    </span>
                  </dd>
                ) : (
                  <dd className="text-ed-mute mt-1 font-serif text-base italic">
                    {t("editorial.mapSection.soon")}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

export { NormandySection }
