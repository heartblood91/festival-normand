import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { localizeEntity } from "@/lib/i18n/db"
import { PreviewBar } from "@/components/admin/preview-bar"
import { ClassicPage } from "@/components/editorial/classic-page"

type PagePreviewPageProps = {
  params: Promise<{ locale: string; id: string }>
}

const PagePreviewPage = async ({ params }: PagePreviewPageProps) => {
  const { locale, id } = (await params) as { locale: Locale; id: string }

  const rawPage = await prisma.page.findUnique({
    where: { id },
  })

  if (!rawPage) {
    notFound()
  }

  const page = localizeEntity(rawPage, locale, ["title", "content"])
  const t = await getTranslations()

  // Same shell as the public page, inside the editorial palette the public layout applies.
  return (
    <div className="editorial bg-background text-foreground min-h-dvh pt-14 font-serif">
      <PreviewBar backUrl={`/admin/pages/${id}/edit`} />
      <ClassicPage title={page.title} content={page.content} marker={t("meta.siteName")} />
    </div>
  )
}

export default PagePreviewPage
