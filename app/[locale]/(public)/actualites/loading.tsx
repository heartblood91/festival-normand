const NewsLoading = () => {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <div className="mb-2 h-9 w-40 animate-pulse rounded bg-white/10" />
        <div className="h-5 w-64 animate-pulse rounded bg-white/5" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <article
            key={i}
            className="animate-pulse overflow-hidden rounded-lg border border-white/10 bg-white/5"
          >
            <div className="aspect-video bg-gradient-to-r from-white/5 to-white/10" />
            <div className="space-y-3 p-4">
              <div className="h-3 w-1/3 rounded bg-white/5" />
              <div className="space-y-2">
                <div className="h-4 w-full rounded bg-white/10" />
                <div className="h-4 w-5/6 rounded bg-white/10" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default NewsLoading
