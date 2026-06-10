import { getTranslations } from "next-intl/server"
import { Marker } from "@/components/editorial/primitives"

const Quote = async () => {
  const t = await getTranslations()

  return (
    <section className="bg-ed-bg-deep border-primary/25 border-y px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[180px_1fr] md:gap-16">
        <Marker index="02" className="md:pt-5">
          {t("editorial.quote.marker")}
        </Marker>
        <figure className="m-0">
          <span
            className="text-primary font-display block text-6xl leading-none italic"
            aria-hidden="true"
          >
            “
          </span>
          <blockquote className="text-foreground font-display mt-3 text-3xl leading-[1.2] font-light tracking-tight text-balance italic md:text-5xl">
            {t("editorial.quote.text")}
          </blockquote>
          <figcaption className="text-ed-mute mt-8 font-sans text-xs tracking-[0.16em] uppercase">
            {t("editorial.quote.attribution")}
          </figcaption>
        </figure>
      </div>
    </section>
  )
}

export { Quote }
