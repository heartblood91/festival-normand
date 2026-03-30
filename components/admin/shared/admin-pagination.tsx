"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type AdminPaginationProps = {
  currentPage: number
  totalPages: number
  baseUrl: string
  searchParams: Record<string, string>
}

export const AdminPagination = ({
  currentPage,
  totalPages,
  baseUrl,
  searchParams,
}: AdminPaginationProps) => {
  const createPageUrl = (page: number): string => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.set(key, value)
    })
    params.set("page", String(page))
    return `${baseUrl}?${params.toString()}`
  }

  const generatePageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = []
    const maxVisible = 5
    const halfVisible = Math.floor(maxVisible / 2)

    let startPage = Math.max(1, currentPage - halfVisible)
    let endPage = Math.min(totalPages, startPage + maxVisible - 1)

    if (endPage - startPage < maxVisible - 1) {
      startPage = Math.max(1, endPage - maxVisible + 1)
    }

    if (startPage > 1) {
      pages.push(1)
      if (startPage > 2) pages.push("...")
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i)
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push("...")
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()
  const hasPrevious = currentPage > 1
  const hasNext = currentPage < totalPages

  return (
    <div className="mt-8 flex items-center justify-center gap-2">
      <Link
        href={createPageUrl(currentPage - 1)}
        className={hasPrevious ? "" : "pointer-events-none opacity-50"}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!hasPrevious}
          className="border border-white/10 bg-white/5 hover:bg-white/10"
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Link>

      {pageNumbers.map((page, index) => {
        if (page === "...") {
          return (
            <span key={`ellipsis-${index}`} className="px-1 text-slate-500">
              ...
            </span>
          )
        }

        const isActive = page === currentPage
        return (
          <Link
            key={page}
            href={createPageUrl(page as number)}
            className={isActive ? "pointer-events-none" : ""}
          >
            <Button
              variant="ghost"
              size="icon-sm"
              disabled={isActive}
              className={
                isActive
                  ? "border border-amber-500/30 bg-amber-500/20 text-amber-400"
                  : "border border-white/10 bg-white/5 hover:bg-white/10"
              }
              aria-current={isActive ? "page" : undefined}
              aria-label={`Page ${page}`}
            >
              {page}
            </Button>
          </Link>
        )
      })}

      <Link
        href={createPageUrl(currentPage + 1)}
        className={hasNext ? "" : "pointer-events-none opacity-50"}
      >
        <Button
          variant="ghost"
          size="icon-sm"
          disabled={!hasNext}
          className="border border-white/10 bg-white/5 hover:bg-white/10"
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}
