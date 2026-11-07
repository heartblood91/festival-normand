export const register = async () => {
  // Keep the import inside a positive NEXT_RUNTIME check: webpack only drops it
  // from the edge bundle in this form (an early return still resolves Prisma,
  // sharp and fs/promises for edge and fails the dev build).
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startTourinsoftScheduler } = await import("@/lib/tourinsoft/scheduler")
    startTourinsoftScheduler()
  }
}
