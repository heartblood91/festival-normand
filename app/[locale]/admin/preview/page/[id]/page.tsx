import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getTranslations } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { localizeEntity } from "@/lib/i18n/db"
import { PreviewBar } from "@/components/admin/preview-bar"
import { MarkdownContent } from "@/components/news/markdown-content"

type PagePreviewPageProps = {
  params: Promise<{ locale: string; id: string }>
}

const PagePreviewPage = async ({ params }: PagePreviewPageProps) => {
  const { locale, id } = await params as { locale: Locale; id: string }
  const t = await getTranslations()

  const rawPage = await prisma.page.findUnique({
    where: { id },
  })

  if (!rawPage) {
    notFound()
  }

  const page = localizeEntity(rawPage, locale, ["title", "content"])

  return (
    <>
      <PreviewBar backUrl={`/admin/pages/${id}/edit`} />
      <article className="mx-auto max-w-4xl px-4 py-8 md:py-12 lg:py-16 pt-20">
        {/* Back link */}
        <a
          href={`/admin/pages/${id}/edit`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:rounded-sm"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </a>

        {/* Title */}
        <h1 className="mb-8 font-serif text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
          {page.title}
        </h1>

        {/* Content */}
        <MarkdownContent content={page.content} />
      </article>
    </>
  )
}

export default PagePreviewPage
