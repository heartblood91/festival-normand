"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

type PreviewBarProps = {
  backUrl: string
}

export const PreviewBar = ({ backUrl }: PreviewBarProps) => {
  const searchParams = useSearchParams()
  const isInDrawer = searchParams.get("drawer") === "true"

  if (isInDrawer) {
    return null
  }

  return (
    <div className="text-primary-foreground fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-4 bg-amber-500/90 px-4 py-3 backdrop-blur-sm md:px-6">
      <p className="font-medium">Preview mode — this content is not published yet</p>
      <Button
        asChild
        variant="outline"
        size="sm"
        className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
      >
        <Link href={backUrl}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to editor
        </Link>
      </Button>
    </div>
  )
}
