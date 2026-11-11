import { getTranslations } from "next-intl/server"
import { Link } from "@/lib/i18n/routing"
import { Marker, Rule } from "@/components/editorial/primitives"

// Rendered inside the public layout: header, skip links and footer stay available.
const PublicNotFound = async () => {
  const t = await getTranslations("notFound")

  return (
    <div className="bg-ed-bg-deep flex min-h-[70vh] items-center justify-center px-4 py-20 md:px-6">
      <title>{`${t("metaTitle")} | Pierres en Lumières`}</title>
      <div className="mx-auto max-w-2xl text-center">
        <Marker className="mb-5">{t("marker")}</Marker>
        <h1 className="text-foreground font-display text-[clamp(2.75rem,9vw,6rem)] leading-[0.95] font-normal tracking-[-0.025em] italic">
          {t("title")}
        </h1>
        <p className="text-ed-bone mx-auto mt-7 max-w-xl font-serif text-xl font-light italic">
          {t("text")}
        </p>
        <Rule />
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="bg-primary text-primary-foreground hover:bg-ed-amber-deep focus-visible:ring-ring inline-flex min-h-11 w-full items-center justify-center px-8 py-4 font-sans text-xs font-semibold tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto"
          >
            {t("home")}
          </Link>
          <Link
            href="/evenements"
            className="border-ed-cream/50 text-foreground hover:border-primary hover:text-primary focus-visible:ring-primary/50 inline-flex min-h-11 w-full items-center justify-center border px-8 py-4 font-sans text-xs font-medium tracking-[0.14em] uppercase transition-colors focus-visible:ring-2 focus-visible:outline-none sm:w-auto"
          >
            {t("programme")}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PublicNotFound
