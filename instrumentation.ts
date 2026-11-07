export const register = async () => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  // Dynamic import keeps Prisma and the scheduler out of the edge bundle.
  const { startTourinsoftScheduler } = await import("@/lib/tourinsoft/scheduler")
  startTourinsoftScheduler()
}
