import type { PartnerItem } from "@/lib/queries/homepage"

type PartnersSectionProps = {
  partners: PartnerItem[]
}

const PartnersSection = ({ partners }: PartnersSectionProps) => {
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
          Nos partenaires
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Un événement soutenu par les acteurs du patrimoine normand
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {partners.map((partner) => (
            <div key={partner.id} className="flex flex-col items-center gap-2">
              {partner.logo ? (
                <a
                  href={partner.website ?? undefined}
                  target={partner.website ? "_blank" : undefined}
                  rel={partner.website ? "noopener noreferrer" : undefined}
                  className="flex h-16 w-28 items-center justify-center rounded-lg bg-white/5 p-3 transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:h-20 md:w-36"
                  aria-label={partner.name}
                >
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain brightness-90 grayscale transition-all hover:brightness-100 hover:grayscale-0"
                    loading="lazy"
                  />
                </a>
              ) : (
                <a
                  href={partner.website ?? undefined}
                  target={partner.website ? "_blank" : undefined}
                  rel={partner.website ? "noopener noreferrer" : undefined}
                  className="flex h-16 w-28 items-center justify-center rounded-lg bg-white/5 p-3 text-center text-xs text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:h-20 md:w-36"
                  aria-label={partner.name}
                >
                  {partner.name}
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export { PartnersSection }
