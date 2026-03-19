"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TiptapEditor } from "@/components/admin/tiptap-editor"
import { TranslateButton } from "@/components/admin/translate-button"
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [slug, setSlug] = useState(article?.slug ?? "")
  const [autoSlug, setAutoSlug] = useState(!article)
  const [contentFr, setContentFr] = useState(article?.contentFr ?? "")
  const [contentEn, setContentEn] = useState(article?.contentEn ?? "")
  const [titleFr, setTitleFr] = useState(article?.titleFr ?? "")
  const [titleEn, setTitleEn] = useState(article?.titleEn ?? "")
  const [excerptFr, setExcerptFr] = useState(article?.excerptFr ?? "")
  const [excerptEn, setExcerptEn] = useState(article?.excerptEn ?? "")
  const [published, setPublished] = useState(article?.published ?? true)

  const handleTitleFrChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitleFr(e.target.value)
      if (autoSlug) {
        setSlug(slugify(e.target.value))
      }
    },
    [autoSlug]
  )

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setAutoSlug(false)
      setSlug(e.target.value)
    },
    []
  )

  const handleTranslated = (translations: Record<string, string>) => {
    if (translations.titleEn) setTitleEn(translations.titleEn)
    if (translations.excerptEn) setExcerptEn(translations.excerptEn)
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
    formData.set("contentFr", contentFr)
    formData.set("contentEn", contentEn)
    formData.set("excerptFr", excerptFr)
    formData.set("excerptEn", excerptEn)
    formData.set("published", String(published))

    const result = article
      ? await updateNews(article.id, formData)
      : await createNews(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push("/admin/news")
      router.refresh()
    } else {
      toast.error(result.message)
      if (result.errors) {
        setErrors(result.errors)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/news">
          <Button type="button" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {article ? "Mettre à jour" : "Créer l'article"}
        </Button>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="fr">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>

            <TabsContent value="fr" className="space-y-4">
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
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Résumé court de l'article..."
                />
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <TranslateButton
                sourceFields={{
                  titleFr,
                  excerptFr,
                  contentFr,
                }}
                onTranslated={handleTranslated}
              />

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
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  placeholder="Short article summary..."
                />
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <Label htmlFor="slug" className="text-slate-300">
              Slug *
            </Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              required
              className="mt-1 border-white/10 bg-white/5 text-white"
              aria-invalid={!!errors.slug}
              aria-describedby={errors.slug ? "slug-error" : undefined}
            />
            {errors.slug && (
              <p id="slug-error" className="mt-1 text-sm text-red-400">
                {errors.slug[0]}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="publishedAt" className="text-slate-300">
                Date de publication *
              </Label>
              <Input
                id="publishedAt"
                name="publishedAt"
                type="date"
                defaultValue={formatDateForInput(article?.publishedAt) || new Date().toISOString().split("T")[0]}
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
              <Label htmlFor="coverImage" className="text-slate-300">
                Image de couverture
              </Label>
              <Input
                id="coverImage"
                name="coverImage"
                defaultValue={article?.coverImage ?? ""}
                placeholder="https://..."
                className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Contenu</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="fr">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>

            <TabsContent value="fr">
              <TiptapEditor content={contentFr} onChange={setContentFr} />
              {errors.contentFr && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.contentFr[0]}
                </p>
              )}
            </TabsContent>

            <TabsContent value="en">
              <TiptapEditor content={contentEn} onChange={setContentEn} />
              {errors.contentEn && (
                <p className="mt-1 text-sm text-red-400">
                  {errors.contentEn[0]}
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Options</CardTitle>
        </CardHeader>
        <CardContent>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 p-3 transition-colors hover:bg-white/5">
            <div>
              <p className="font-medium text-white">Publié</p>
              <p className="text-sm text-slate-400">
                Rendre cet article visible sur le site public
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={published}
              onClick={() => setPublished(!published)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                published ? "bg-amber-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                  published ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/admin/news">
          <Button type="button" variant="ghost">
            Annuler
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {article ? "Mettre à jour" : "Créer l'article"}
        </Button>
      </div>
    </form>
  )
}
