import Link from "next/link"
import { Button } from "@/components/ui/button"
import { FESTIVAL_DATES } from "@/lib/navigation"
import { SparkleIcon } from "@/components/ui/sparkle-icon"
import { HeroVideo } from "@/components/home/hero-video"

const HeroSection = () => {
  return (
    <section
      className="relative flex min-h-[80dvh] flex-col items-center justify-center overflow-hidden px-4 py-20 text-center md:min-h-[85dvh] md:py-32"
      aria-label="Présentation du festival"
    >
      <HeroVideo />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/80 via-background/60 to-background" aria-hidden="true" />

      {/* Decorative ambient glow */}
      <div
        className="absolute left-1/2 top-1/3 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]"
        aria-hidden="true"
      />

      <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary md:text-base">
        <SparkleIcon className="size-4" />
        Festival du Patrimoine Normand
      </p>

      <h1 className="font-serif text-4xl font-bold leading-tight text-foreground md:text-6xl lg:text-7xl">
        Pierres en Lumières
      </h1>

      <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-xl lg:text-2xl">
        Découvrez la magie du patrimoine normand en nocturne
      </p>

      <p className="mt-3 text-lg font-semibold text-primary md:text-2xl lg:text-3xl">
        {FESTIVAL_DATES}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
        <Button asChild size="lg" className="h-12 px-6 text-base">
          <Link href="/evenements">Découvrir les événements</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
          <Link href="/inscription">Inscrire un site</Link>
        </Button>
      </div>
    </section>
  )
}

export { HeroSection }
