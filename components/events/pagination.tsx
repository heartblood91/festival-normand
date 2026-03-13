"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

type PaginationProps = {
  currentPage: number
  totalPages: number
}

const Pagination = ({ currentPage, totalPages }: PaginationProps) => {
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const buildHref = (page: number): string => {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) {
      params.set("page", String(page))
    } else {
      params.delete("page")
    }
    const qs = params.toString()
    return `/evenements${qs ? `?${qs}` : ""}`
  }

  const pages = generatePageNumbers(currentPage, totalPages)

  return (
    <nav aria-label="Pagination des événements" className="flex justify-center">
      <ul className="flex items-center gap-1.5">
        <li>
          {currentPage > 1 ? (
            <Link
              href={buildHref(currentPage - 1)}
              className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:size-11"
              aria-label="Page précédente"
            >
              <ChevronLeft className="size-4" />
            </Link>
          ) : (
            <span
              className="flex size-10 items-center justify-center rounded-lg border border-white/5 text-muted-foreground/30 md:size-11"
              aria-disabled="true"
            >
              <ChevronLeft className="size-4" />
            </span>
          )}
        </li>

        {pages.map((p, i) =>
          p === "..." ? (
            <li key={`ellipsis-${i}`}>
              <span className="flex size-10 items-center justify-center text-muted-foreground md:size-11">
                …
              </span>
            </li>
          ) : (
            <li key={p}>
              <Link
                href={buildHref(p as number)}
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:size-11",
                  p === currentPage
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-foreground"
                )}
                aria-label={`Page ${p}`}
                aria-current={p === currentPage ? "page" : undefined}
              >
                {p}
              </Link>
            </li>
          )
        )}

        <li>
          {currentPage < totalPages ? (
            <Link
              href={buildHref(currentPage + 1)}
              className="flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 md:size-11"
              aria-label="Page suivante"
            >
              <ChevronRight className="size-4" />
            </Link>
          ) : (
            <span
              className="flex size-10 items-center justify-center rounded-lg border border-white/5 text-muted-foreground/30 md:size-11"
              aria-disabled="true"
            >
              <ChevronRight className="size-4" />
            </span>
          )}
        </li>
      </ul>
    </nav>
  )
}

const generatePageNumbers = (current: number, total: number): (number | "...")[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages: (number | "...")[] = [1]

  if (current > 3) pages.push("...")

  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  if (current < total - 2) pages.push("...")

  pages.push(total)

  return pages
}

export { Pagination, generatePageNumbers }
