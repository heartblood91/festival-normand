import { getTranslations } from "next-intl/server"
import type { PartnerItem } from "@/lib/queries/homepage"

type PartnersSectionProps = {
  partners: PartnerItem[]
}

const PartnersSection = async ({ partners }: PartnersSectionProps) => {
  const t = await getTranslations()
  if (partners.length === 0) return null

  return (
    <section
      className="border-t border-white/10 py-16 md:py-20"
      aria-labelledby="partners-heading"
    >
      <div className="mx-auto max-w-7xl px-4 text-center">
        <h2
          id="partners-heading"
          className="font-serif text-xl font-bold text-foreground md:text-2xl"
        >
          {t("partners.title")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("partners.subtitle")}
        </p>

        <div className="mt-10 grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-7 md:gap-6">
          {partners.map((partner, index) => {
            const Wrapper = partner.website ? "a" : "div"
            const linkProps = partner.website
              ? { href: partner.website, target: "_blank" as const, rel: "noopener noreferrer" }
              : {}

            return (
              <Wrapper
                key={partner.id}
                {...linkProps}
                className="flex aspect-square items-center justify-center rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                {...(partner.website ? { "aria-label": partner.name } : {})}
              >
                {partner.logo ? (
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    width={120}
                    height={80}
                    className="max-h-full max-w-full object-contain"
                    loading={index < 7 ? "eager" : "lazy"}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">{partner.name}</span>
                )}
              </Wrapper>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export { PartnersSection }
