import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EventCard } from "@/components/home/event-card"
import type { FeaturedEvent } from "@/lib/queries/homepage"

type FeaturedEventsProps = {
  events: FeaturedEvent[]
}

const FeaturedEvents = ({ events }: FeaturedEventsProps) => {
  if (events.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:py-24" aria-labelledby="featured-events-heading">
      <div className="mb-8 flex items-end justify-between gap-4 md:mb-12">
        <div>
          <h2
            id="featured-events-heading"
            className="font-serif text-2xl font-bold text-foreground md:text-3xl lg:text-4xl"
          >
            Événements à la une
          </h2>
          <p className="mt-2 text-sm text-muted-foreground md:text-base">
            Les incontournables de cette édition
          </p>
        </div>
        <Button
          render={<Link href="/evenements" />}
          variant="ghost"
          className="hidden items-center gap-1 text-primary sm:inline-flex"
        >
          Voir tous
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>

      <div className="mt-8 text-center sm:hidden">
        <Button
          render={<Link href="/evenements" />}
          variant="outline"
          className="gap-1"
        >
          Voir tous les événements
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </section>
  )
}

export { FeaturedEvents }
