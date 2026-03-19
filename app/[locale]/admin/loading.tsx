const AdminLoading = () => {
  return (
    <div
      className="flex min-h-screen items-center justify-center bg-slate-950"
      role="status"
      aria-label="Chargement en cours"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="relative size-12">
          <div className="absolute inset-0 animate-spin rounded-full bg-gradient-to-r from-amber-400 to-amber-600" />
          <div className="absolute inset-1 rounded-full bg-slate-950" />
        </div>
        <p className="text-sm font-medium text-slate-400">
          Chargement en cours...
        </p>
      </div>
    </div>
  )
}

export default AdminLoading
