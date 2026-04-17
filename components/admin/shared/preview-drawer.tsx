"use client"

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"

type PreviewDrawerProps = {
  url: string
  open: boolean
  onClose: () => void
}

export const PreviewDrawer = ({ url, open, onClose }: PreviewDrawerProps) => {
  const separator = url.includes("?") ? "&" : "?"
  const urlWithDrawerParam = `${url}${separator}drawer=true&nosidebar=true`

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="!w-[70vw] !max-w-[70vw] border-white/10 bg-slate-950 p-0"
      >
        <SheetHeader className="border-b border-white/10 px-6 py-4">
          <SheetTitle className="text-white">Aperçu</SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-60px)] w-full overflow-hidden">
          <iframe src={urlWithDrawerParam} className="h-full w-full border-0" title="Aperçu" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
