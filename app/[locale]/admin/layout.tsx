const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-dvh flex-col bg-slate-950">
      {children}
    </div>
  )
}

export default AdminLayout
