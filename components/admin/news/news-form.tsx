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
import { PublishWizard, type PublishWizardResult } from "@/components/admin/publish/publish-wizard"
import { createNews, updateNews } from "@/lib/actions/news"
import {
  applySpellingCorrections,
  fillMissingTranslations,
  missingTranslationSource,
  needsPublishWizard,
} from "@/lib/admin/publish-flow"
import { translateMissingFields } from "@/lib/admin/translate-missing"
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
  const wasPublished = article?.published ?? false
  const [published, setPublished] = useState(wasPublished)
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

  const save = async (overrides: Record<string, string> = {}): Promise<boolean> => {
    if (!formRef.current) return false
    const fields: Record<string, string> = {
      slug,
      titleFr,
      titleEn,
      contentFr,
      contentEn,
      excerptFr,
      excerptEn,
      coverImage,
      published: String(published),
      ...overrides,
    }
    const formData = new FormData(formRef.current)
    Object.entries(fields).forEach(([name, value]) => formData.set(name, value))

    setIsSubmitting(true)
    setErrors({})
    const result = article ? await updateNews(article.id, formData) : await createNews(formData)
    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push("/admin/news")
      router.refresh()
      return true
    }
    if (result.errors) {
      setErrors(result.errors)
      const errorList = Object.entries(result.errors)
        .map(([, msgs]) => msgs.join(", "))
        .join(" • ")
      toast.error(`${result.message} — ${errorList}`, { duration: 8000 })
    } else {
      toast.error(result.message)
    }
    return false
  }

  const handleWizardComplete = async ({ translations, corrections }: PublishWizardResult) => {
    const correctedTitleFr = applySpellingCorrections(titleFr, corrections)
    const correctedContentFr = applySpellingCorrections(contentFr, corrections)
    const english = fillMissingTranslations(
      { title: titleEn, content: contentEn, excerpt: excerptEn },
      translations
    )
    setTitleFr(correctedTitleFr)
    setContentFr(correctedContentFr)
    setTitleEn(english.title)
    setContentEn(english.content)
    setExcerptEn(english.excerpt)

    const saved = await save({
      titleFr: correctedTitleFr,
      contentFr: correctedContentFr,
      titleEn: english.title,
      contentEn: english.content,
      excerptEn: english.excerpt,
      published: "true",
    })
    if (saved) setShowPublishWizard(false)
    return saved
  }

  const handleWizardCancel = () => {
    setShowPublishWizard(false)
    setPublished(wasPublished)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (needsPublishWizard({ wasPublished, willPublish: published })) {
      setShowPublishWizard(true)
      return
    }
    await save()
  }

  return (
    <>
      {showPublishWizard && (
        <PublishWizard
          title={titleFr}
          content={contentFr}
          locale="fr"
          contentType="news"
          translationSource={missingTranslationSource({
            title: [titleFr, titleEn],
            content: [contentFr, contentEn],
            excerpt: [excerptFr, excerptEn],
          })}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <FormActionBar
          previewUrl={article ? `/${locale}/admin/preview/news/${article.id}` : undefined}
          isPublished={published}
          onTogglePublish={setPublished}
          ai={{
            title: titleFr,
            content: contentFr,
            translateMissing: async () => {
              const filled = await translateMissingFields({
                title: [titleFr, titleEn],
                content: [contentFr, contentEn],
                excerpt: [excerptFr, excerptEn],
              })
              if (filled.title) setTitleEn(filled.title)
              if (filled.content) setContentEn(filled.content)
              if (filled.excerpt) setExcerptEn(filled.excerpt)
              return Object.keys(filled).length
            },
          }}
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
