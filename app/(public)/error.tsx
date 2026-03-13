"use client"

import { useEffect } from "react"
import { AlertTriangle, RefreshCcw } from "lucide-react"

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const PublicError = ({ error, reset }: ErrorProps) => {
  useEffect(() => {
    console.error("Public page error:", error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-red-500/10 p-3">
              <AlertTriangle className="size-8 text-red-400" aria-hidden="true" />
            </div>
          </div>

          <h1 className="mb-3 text-center font-serif text-2xl font-bold text-foreground">
            Oups, une erreur s&apos;est produite
          </h1>

          <p className="mb-8 text-center text-sm text-muted-foreground">
            Une erreur inattendue s&apos;est produite. Veuillez essayer à
            nouveau.
          </p>

          {error.digest && (
            <p className="mb-6 text-center text-xs text-muted-foreground/60">
              ID : {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-6 py-3 font-medium text-primary backdrop-blur-xl transition-colors hover:bg-amber-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            <RefreshCcw className="size-5" aria-hidden="true" />
            Réessayer
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublicError
