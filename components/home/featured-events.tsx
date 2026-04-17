import Link from "next/link"
import { getTranslations, getLocale } from "next-intl/server"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/home/event-card"
import type { FeaturedEvent } from "@/lib/queries/homepage"

type FeaturedEventsProps = {
  events: FeaturedEvent[]
}

const FeaturedEvents = async ({ events }: FeaturedEventsProps) => {
  const t = await getTranslations()
  const locale = await getLocale()
  if (events.length === 0) return null

  return (
    <section
      className="mx-auto max-w-7xl px-4 py-16 md:py-24"
      aria-labelledby="featured-events-heading"
    >
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
        <div>
          <h2
            id="featured-events-heading"
            className="text-foreground font-serif text-2xl font-bold md:text-3xl lg:text-4xl"
          >
            {t("featured.title")}
          </h2>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            {t("featured.subtitle")}
          </p>
        </div>
        <Button
          asChild
          variant="ghost"
          className="text-primary hidden items-center gap-1 sm:inline-flex"
          aria-label={t("featured.viewAllLabel")}
        >
          <Link href={`/${locale}/evenements`}>
            {t("featured.viewAll")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {events.map((event, index) => (
          <EventCard key={event.id} event={event} priority={index < 3} />
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Button asChild variant="outline" className="gap-1" aria-label={t("featured.viewAllLabel")}>
          <Link href={`/${locale}/evenements`}>
            {t("featured.viewAll")}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </section>
  )
}

export { FeaturedEvents }
