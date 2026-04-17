const PublicLoading = () => {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="Chargement en cours"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-12">
          <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />
          <div className="bg-background absolute inset-1 rounded-full" />
        </div>
        <p className="text-muted-foreground text-sm font-medium">Chargement en cours...</p>
      </div>
    </div>
  )
}

export default PublicLoading
