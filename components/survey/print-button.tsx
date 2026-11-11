"use client"

import { Printer } from "lucide-react"

export const PrintButton = ({ label }: { label: string }) => (
  <button
    type="button"
    onClick={() => window.print()}
    className="inline-flex min-h-11 cursor-pointer items-center gap-2 border-2 border-black px-5 py-2 font-sans text-sm font-semibold tracking-[0.12em] uppercase hover:bg-black hover:text-white focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
  >
    <Printer className="size-4" aria-hidden="true" />
    {label}
  </button>
)
