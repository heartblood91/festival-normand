type ListingSkeletonProps = {
  cards: number
  /** Matches the real page header: centred on the programme, left-aligned on news. */
  centered?: boolean
  columns: string
}

// Same header band and card frames as the listing it stands for, so the page does not
// jump when the content replaces it.
export const ListingSkeleton = ({ cards, centered = false, columns }: ListingSkeletonProps) => (
  <div aria-busy="true" className="animate-pulse">
    <div className="bg-ed-bg-deep border-primary/25 border-b px-4 py-14 md:px-6 md:py-16">
      <div
        className={centered ? "mx-auto flex max-w-4xl flex-col items-center" : "mx-auto max-w-7xl"}
      >
        <div className="bg-primary/25 mb-4 h-3 w-40" />
        <div className="bg-foreground/10 h-[clamp(2.5rem,7vw,5.5rem)] w-3/4 max-w-2xl" />
      </div>
    </div>
    <div className={`mx-auto grid max-w-7xl gap-5 px-4 py-10 md:px-6 ${columns}`}>
      {Array.from({ length: cards }).map((_, i) => (
        <div key={i} className="bg-ed-bg-soft border-primary/15 border">
          <div className="bg-foreground/5 border-primary/15 aspect-[16/10] border-b" />
          <div className="space-y-3 p-5">
            <div className="bg-primary/20 h-3 w-1/3" />
            <div className="bg-foreground/10 h-5 w-5/6" />
            <div className="bg-foreground/5 h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
)
