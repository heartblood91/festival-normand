import Image from "next/image"
import { getTranslations } from "next-intl/server"
import type { PartnerItem } from "@/lib/queries/homepage"
import { SectionHeading } from "@/components/editorial/primitives"

const initials = (name: string) =>
  name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase()

type PartnersProps = {
  partners: PartnerItem[]
  markerIndex: string
}

const Partners = async ({ partners, markerIndex }: PartnersProps) => {
  if (partners.length === 0) return null
  const t = await getTranslations()

  return (
    <section className="bg-background border-primary/25 border-t px-4 py-20 md:px-6 md:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          markerIndex={markerIndex}
          marker={t("editorial.partnersSection.marker")}
          title={t("editorial.partnersSection.title")}
        />

        <ul className="bg-primary/25 grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner) => {
            const cell = (
              <div className="bg-ed-bg-deep flex h-28 flex-col items-center justify-center gap-2.5 p-4 text-center">
                {partner.logo ? (
                  <span className="relative flex h-16 w-full items-center justify-center rounded-sm bg-white/95 px-4 py-2.5">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      fill
                      sizes="160px"
                      className="object-contain p-1"
                    />
                  </span>
                ) : (
                  <>
                    <span
                      className="border-primary/50 text-primary font-display flex size-10 items-center justify-center rounded-full border text-sm italic"
                      aria-hidden="true"
                    >
                      {initials(partner.name)}
                    </span>
                    <span className="text-ed-bone font-mono text-[9px] tracking-[0.14em] uppercase opacity-70">
                      {partner.name}
                    </span>
                  </>
                )}
              </div>
            )
            return (
              <li key={partner.id}>
                {partner.website ? (
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="focus-visible:ring-primary/50 hover:bg-ed-bg-soft block transition-colors focus-visible:z-10 focus-visible:ring-2 focus-visible:outline-none"
                    aria-label={`${partner.name} ${t("a11y.newTab")}`}
                  >
                    {cell}
                  </a>
                ) : (
                  cell
                )}
              </li>
            )
          })}
        </ul>

        <p className="text-ed-bone mx-auto mt-8 max-w-3xl text-center font-serif text-base font-light italic opacity-75">
          {t("editorial.partnersSection.note")}
        </p>
      </div>
    </section>
  )
}

export { Partners }
