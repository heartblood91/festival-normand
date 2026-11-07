"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLocale } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TiptapEditor } from "@/components/admin/tiptap-editor"
import { FormActionBar } from "@/components/admin/shared/form-action-bar"
import { DraftBanner } from "@/components/admin/shared/draft-banner"
import {
  LocaleTabs,
  localePanelProps,
  type FormLocale,
} from "@/components/admin/shared/locale-tabs"
import { useFormDraft } from "@/components/admin/shared/use-form-draft"
import { createPage, updatePage } from "@/lib/actions/pages"
import { slugify } from "@/lib/schemas/event"
import { markdownToHtml, htmlToMarkdown } from "@/lib/utils/markdown"
import { translateMissingFields } from "@/lib/admin/translate-missing"
import { draftKey } from "@/lib/admin/form-draft"
import { localeTabStatus } from "@/lib/admin/form-status"
import type { Page } from "@prisma/client"

const SYSTEM_SLUGS = ["festival", "inscription", "mentions-legales"]

const LOCALE_FIELDS = {
  fr: ["titleFr", "contentFr"],
  en: ["titleEn", "contentEn"],
}

type PageFormProps = {
  page?: Page
}

export const PageForm = ({ page }: PageFormProps) => {
  const router = useRouter()
  const locale = useLocale()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [formLocale, setFormLocale] = useState<FormLocale>("fr")
  const [slug, setSlug] = useState(page?.slug ?? "")
  const [autoSlug] = useState(!page)
  const [titleFr, setTitleFr] = useState(page?.titleFr ?? "")
  const [titleEn, setTitleEn] = useState(page?.titleEn ?? "")
  const [contentFr, setContentFr] = useState(markdownToHtml(page?.contentFr ?? ""))
  const [contentEn, setContentEn] = useState(markdownToHtml(page?.contentEn ?? ""))

  const isSystemPage = page ? SYSTEM_SLUGS.includes(page.slug) : false

  const draftValues: Record<string, string> = { slug, titleFr, titleEn, contentFr, contentEn }

  const { dirty, draft, restoreDraft, discardDraft, markSaved } = useFormDraft({
    storageKey: draftKey("page", page?.id),
    formRef,
    values: draftValues,
    onRestore: (values) => {
      setSlug(values.slug ?? slug)
      setTitleFr(values.titleFr ?? "")
      setTitleEn(values.titleEn ?? "")
      setContentFr(values.contentFr ?? "")
      setContentEn(values.contentEn ?? "")
    },
  })

  const tabStatus = localeTabStatus({ fields: LOCALE_FIELDS, errors, values: draftValues })

  const handleTitleFrChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitleFr(e.target.value)
      if (autoSlug && !isSystemPage) {
        setSlug(slugify(e.target.value))
      }
    },
    [autoSlug, isSystemPage]
  )

  const handleSaveClick = useCallback(() => {
    formRef.current?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    formData.set("slug", slug)
    formData.set("titleFr", titleFr)
    formData.set("titleEn", titleEn)
    formData.set("contentFr", htmlToMarkdown(contentFr))
    formData.set("contentEn", htmlToMarkdown(contentEn))

    const result = page ? await updatePage(page.id, formData) : await createPage(formData)

    setIsSubmitting(false)

    if (result.success) {
      markSaved()
      toast.success(result.message)
      router.push("/admin/pages")
      router.refresh()
    } else {
      toast.error(result.message)
      if (result.errors) {
        setErrors(result.errors)
        const failed = localeTabStatus({
          fields: LOCALE_FIELDS,
          errors: result.errors,
          values: draftValues,
        })
        if (failed.en === "error" && failed.fr !== "error") setFormLocale("en")
      }
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <FormActionBar
        previewUrl={page ? `/${locale}/admin/preview/page/${page.id}` : undefined}
        isDirty={dirty}
        ai={{
          title: titleFr,
          content: contentFr,
          translateMissing: async () => {
            const filled = await translateMissingFields({
              title: [titleFr, titleEn],
              content: [contentFr, contentEn],
            })
            if (filled.title) setTitleEn(filled.title)
            if (filled.content) setContentEn(filled.content)
            return Object.keys(filled).length
          },
        }}
        onSubmit={handleSaveClick}
        isSubmitting={isSubmitting}
        saveLabel={page ? "Mettre à jour" : "Créer la page"}
        backUrl="/admin/pages"
      />

      {draft && <DraftBanner draft={draft} onRestore={restoreDraft} onDiscard={discardDraft} />}

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Informations</CardTitle>
          <LocaleTabs
            value={formLocale}
            onChange={setFormLocale}
            status={tabStatus}
            panelIds={["page-panel-general", "page-panel-content"]}
          />
        </CardHeader>
        <CardContent className="space-y-4">
          <div {...localePanelProps("page-panel-general", formLocale)}>
            {formLocale === "fr" ? (
              <div>
                <Label htmlFor="titleFr" className="text-slate-300">
                  Titre *
                </Label>
                <Input
                  id="titleFr"
                  name="titleFr"
                  value={titleFr}
                  onChange={handleTitleFrChange}
                  required
                  className="mt-1 border-white/10 bg-white/5 text-white"
                  aria-invalid={!!errors.titleFr}
                  aria-describedby={errors.titleFr ? "titleFr-error" : undefined}
                />
                {errors.titleFr && (
                  <p id="titleFr-error" className="mt-1 text-sm text-red-400">
                    {errors.titleFr[0]}
                  </p>
                )}
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="titleEn" className="text-slate-300">
                    Title
                  </Label>
                  <Input
                    id="titleEn"
                    name="titleEn"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="mt-1 border-white/10 bg-white/5 text-white"
                    aria-describedby={errors.titleEn ? "titleEn-error" : undefined}
                  />
                  {errors.titleEn && (
                    <p id="titleEn-error" className="mt-1 text-sm text-red-400">
                      {errors.titleEn[0]}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div>
            <Label htmlFor="slug" className="mb-2 block text-slate-300">
              Slug
            </Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              readOnly
              required
              className="cursor-not-allowed border-white/10 bg-slate-900 text-slate-400 opacity-60"
              aria-invalid={!!errors.slug}
              aria-describedby={errors.slug ? "slug-error" : undefined}
            />
            {errors.slug && (
              <p id="slug-error" className="mt-1 text-sm text-red-400">
                {errors.slug[0]}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Contenu</CardTitle>
        </CardHeader>
        <CardContent {...localePanelProps("page-panel-content", formLocale)}>
          {formLocale === "fr" ? (
            <>
              <TiptapEditor content={contentFr} onChange={setContentFr} />
              {errors.contentFr && (
                <p className="mt-1 text-sm text-red-400">{errors.contentFr[0]}</p>
              )}
            </>
          ) : (
            <>
              <TiptapEditor content={contentEn} onChange={setContentEn} />
              {errors.contentEn && (
                <p className="mt-1 text-sm text-red-400">{errors.contentEn[0]}</p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </form>
  )
}
