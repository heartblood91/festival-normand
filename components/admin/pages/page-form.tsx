"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useLocale } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TiptapEditor } from "@/components/admin/tiptap-editor"
import { FormActionBar } from "@/components/admin/shared/form-action-bar"
import { createPage, updatePage } from "@/lib/actions/pages"
import { slugify } from "@/lib/schemas/event"
import { markdownToHtml, htmlToMarkdown } from "@/lib/utils/markdown"
import type { Page } from "@prisma/client"

const SYSTEM_SLUGS = ["festival", "inscription", "mentions-legales"]

type PageFormProps = {
  page?: Page
}

export const PageForm = ({ page }: PageFormProps) => {
  const router = useRouter()
  const locale = useLocale()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [formLocale, setFormLocale] = useState<"fr" | "en">("fr")
  const [slug, setSlug] = useState(page?.slug ?? "")
  const [autoSlug, setAutoSlug] = useState(!page)
  const [titleFr, setTitleFr] = useState(page?.titleFr ?? "")
  const [titleEn, setTitleEn] = useState(page?.titleEn ?? "")
  const [contentFr, setContentFr] = useState(markdownToHtml(page?.contentFr ?? ""))
  const [contentEn, setContentEn] = useState(markdownToHtml(page?.contentEn ?? ""))

  const isSystemPage = page ? SYSTEM_SLUGS.includes(page.slug) : false

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
    formRef.current?.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    )
  }, [])

  const handleTranslated = (translations: Record<string, string>) => {
    if (translations.titleEn) setTitleEn(translations.titleEn)
    if (translations.contentEn) setContentEn(translations.contentEn)
  }

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

    const result = page
      ? await updatePage(page.id, formData)
      : await createPage(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push("/admin/pages")
      router.refresh()
    } else {
      toast.error(result.message)
      if (result.errors) {
        setErrors(result.errors)
      }
    }
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
      <FormActionBar
        previewUrl={page ? `/${locale}/admin/preview/page/${page.id}` : undefined}
        isPublished={true}
        onTogglePublish={() => {}}
        onSubmit={handleSaveClick}
        isSubmitting={isSubmitting}
        saveLabel={page ? "Mettre à jour" : "Créer la page"}
        backUrl="/admin/pages"
      />

      <Card className="border-white/10 bg-white/5">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-white">Informations</CardTitle>
          <div className="flex items-center gap-2">
            <div className="inline-flex gap-1 rounded-lg border border-white/10 p-1">
              <button
                type="button"
                onClick={() => setFormLocale("fr")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  formLocale === "fr"
                    ? "bg-amber-500 text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setFormLocale("en")}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  formLocale === "en"
                    ? "bg-amber-500 text-white"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                EN
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div>
            <Label htmlFor="slug" className="text-slate-300 block mb-2">
              Slug
            </Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              readOnly
              required
              className="border-white/10 bg-slate-900 text-slate-400 cursor-not-allowed opacity-60"
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
        <CardContent>
          {formLocale === "fr" ? (
            <>
              <TiptapEditor content={contentFr} onChange={setContentFr} />
              {errors.contentFr && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.contentFr[0]}
                </p>
              )}
            </>
          ) : (
            <>
              <TiptapEditor content={contentEn} onChange={setContentEn} />
              {errors.contentEn && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.contentEn[0]}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </form>
  )
}
