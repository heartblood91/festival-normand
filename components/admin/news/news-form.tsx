"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLocale } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TiptapEditor } from "@/components/admin/tiptap-editor"
import { ImageUpload } from "@/components/admin/image-upload"
import { FormActionBar } from "@/components/admin/shared/form-action-bar"
import { PublishWizard } from "@/components/admin/publish/publish-wizard"
import { createNews, updateNews } from "@/lib/actions/news"
import { slugify } from "@/lib/schemas/event"
import type { News } from "@prisma/client"

type NewsFormProps = {
  article?: News
}

const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return ""
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

export const NewsForm = ({ article }: NewsFormProps) => {
  const router = useRouter()
  const locale = useLocale()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [formLocale, setFormLocale] = useState<"fr" | "en">("fr")
  const [slug, setSlug] = useState(article?.slug ?? "")
  const [autoSlug] = useState(!article)
  const [contentFr, setContentFr] = useState(article?.contentFr ?? "")
  const [contentEn, setContentEn] = useState(article?.contentEn ?? "")
  const [titleFr, setTitleFr] = useState(article?.titleFr ?? "")
  const [titleEn, setTitleEn] = useState(article?.titleEn ?? "")
  const [excerptFr, setExcerptFr] = useState(article?.excerptFr ?? "")
  const [excerptEn, setExcerptEn] = useState(article?.excerptEn ?? "")
  const [coverImage, setCoverImage] = useState(article?.coverImage ?? "")
  const [published, setPublished] = useState(article?.published ?? false)
  const [showPublishWizard, setShowPublishWizard] = useState(false)

  const handleTitleFrChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitleFr(e.target.value)
      if (autoSlug) {
        setSlug(slugify(e.target.value))
      }
    },
    [autoSlug]
  )

  const handleSaveClick = useCallback(() => {
    formRef.current?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }))
  }, [])

  const handlePublishClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setShowPublishWizard(true)
  }

  const handleWizardComplete = async (translatedFields?: Record<string, string>) => {
    setShowPublishWizard(false)

    const newTitleEn = translatedFields?.title || titleEn
    const newContentEn = translatedFields?.description || contentEn
    const newExcerptEn = translatedFields?.excerpt || excerptEn

    if (translatedFields?.title) setTitleEn(newTitleEn)
    if (translatedFields?.description) setContentEn(newContentEn)
    if (translatedFields?.excerpt) setExcerptEn(newExcerptEn)

    const formData = new FormData()
    formData.set("slug", slug)
    formData.set("titleFr", titleFr)
    formData.set("titleEn", newTitleEn)
    formData.set("contentFr", contentFr)
    formData.set("contentEn", newContentEn)
    formData.set("excerptFr", excerptFr)
    formData.set("excerptEn", newExcerptEn)
    formData.set("coverImage", coverImage)
    formData.set("published", String(true))

    const publishedAtInput = document.querySelector<HTMLInputElement>('[name="publishedAt"]')
    if (publishedAtInput?.value) formData.set("publishedAt", publishedAtInput.value)

    setIsSubmitting(true)
    setErrors({})

    const result = article ? await updateNews(article.id, formData) : await createNews(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push("/admin/news")
      router.refresh()
    } else {
      if (result.errors) {
        setErrors(result.errors)
        const errorList = Object.entries(result.errors)
          .map(([, msgs]) => msgs.join(", "))
          .join(" • ")
        toast.error(`${result.message} — ${errorList}`, { duration: 8000 })
      } else {
        toast.error(result.message)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (published) {
      handlePublishClick(e)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    formData.set("slug", slug)
    formData.set("titleFr", titleFr)
    formData.set("titleEn", titleEn)
    formData.set("contentFr", contentFr)
    formData.set("contentEn", contentEn)
    formData.set("excerptFr", excerptFr)
    formData.set("excerptEn", excerptEn)
    formData.set("coverImage", coverImage)
    formData.set("published", String(published))

    const result = article ? await updateNews(article.id, formData) : await createNews(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push("/admin/news")
      router.refresh()
    } else {
      if (result.errors) {
        setErrors(result.errors)
        const errorList = Object.entries(result.errors)
          .map(([, msgs]) => msgs.join(", "))
          .join(" • ")
        toast.error(`${result.message} — ${errorList}`, { duration: 8000 })
      } else {
        toast.error(result.message)
      }
    }
  }

  return (
    <>
      {showPublishWizard && (
        <PublishWizard
          title={titleFr}
          content={contentFr}
          locale="fr"
          contentType="news"
          onComplete={handleWizardComplete}
          onCancel={() => setShowPublishWizard(false)}
        />
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <FormActionBar
          previewUrl={article ? `/${locale}/admin/preview/news/${article.id}` : undefined}
          isPublished={published}
          onTogglePublish={setPublished}
          onSubmit={handleSaveClick}
          isSubmitting={isSubmitting}
          saveLabel={article ? "Mettre à jour" : "Créer l'article"}
          backUrl="/admin/news"
        />

        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Informations générales</CardTitle>
            <div className="flex items-center gap-2">
              <div className="inline-flex gap-1 rounded-lg border border-white/10 p-1">
                <button
                  type="button"
                  onClick={() => setFormLocale("fr")}
                  className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
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
                  className={`rounded px-3 py-1 text-sm font-medium transition-colors ${
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
              <>
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

                <div>
                  <Label htmlFor="excerptFr" className="text-slate-300">
                    Extrait
                  </Label>
                  <textarea
                    id="excerptFr"
                    name="excerptFr"
                    value={excerptFr}
                    onChange={(e) => setExcerptFr(e.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                    placeholder="Résumé court de l'article..."
                  />
                </div>
              </>
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

                <div>
                  <Label htmlFor="excerptEn" className="text-slate-300">
                    Excerpt
                  </Label>
                  <textarea
                    id="excerptEn"
                    name="excerptEn"
                    value={excerptEn}
                    onChange={(e) => setExcerptEn(e.target.value)}
                    rows={4}
                    className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
                    placeholder="Short article summary..."
                  />
                </div>
              </>
            )}

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

            <div>
              <Label htmlFor="publishedAt" className="text-slate-300">
                Date de publication *
              </Label>
              <Input
                id="publishedAt"
                name="publishedAt"
                type="date"
                defaultValue={
                  formatDateForInput(article?.publishedAt) || new Date().toISOString().split("T")[0]
                }
                required
                className="mt-1 border-white/10 bg-white/5 text-white"
                aria-invalid={!!errors.publishedAt}
                aria-describedby={errors.publishedAt ? "publishedAt-error" : undefined}
              />
              {errors.publishedAt && (
                <p id="publishedAt-error" className="mt-1 text-sm text-red-400">
                  {errors.publishedAt[0]}
                </p>
              )}
            </div>

            <div>
              <Label className="mb-2 block text-slate-300">Image de couverture</Label>
              <ImageUpload value={coverImage} onChange={setCoverImage} preset="cover" />
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
    </>
  )
}
