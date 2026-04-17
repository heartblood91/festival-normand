import type { Locale } from "@/lib/i18n/config"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { localizeEntity } from "@/lib/i18n/db"
import { PreviewBar } from "@/components/admin/preview-bar"
import { MarkdownContent } from "@/components/news/markdown-content"

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

  return (
    <>
      <PreviewBar backUrl={`/admin/pages/${id}/edit`} />
      <article className="mx-auto max-w-4xl px-4 py-8 pt-20 md:py-12 lg:py-16">
        {/* Back link */}
        <a
          href={`/admin/pages/${id}/edit`}
          className="text-muted-foreground hover:text-foreground focus-visible:ring-primary/50 mb-6 inline-flex items-center gap-2 text-sm transition-colors focus-visible:rounded-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </a>

        {/* Title */}
        <h1 className="text-foreground mb-8 font-serif text-3xl font-bold md:text-4xl lg:text-5xl">
          {page.title}
        </h1>

        {/* Content */}
        <MarkdownContent content={page.content} />
      </article>
    </>
  )
}

export default PagePreviewPage
