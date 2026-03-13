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
import { TiptapEditor } from "@/components/admin/tiptap-editor"
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
  const [content, setContent] = useState(article?.content ?? "")
  const [published, setPublished] = useState(article?.published ?? true)

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    formData.set("slug", slug)
    formData.set("content", content)
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
          <div>
            <Label htmlFor="title" className="text-slate-300">
              Titre *
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={article?.title ?? ""}
              onChange={handleTitleChange}
              required
              className="mt-1 border-white/10 bg-white/5 text-white"
              aria-invalid={!!errors.title}
              aria-describedby={errors.title ? "title-error" : undefined}
            />
            {errors.title && (
              <p id="title-error" className="mt-1 text-sm text-red-400">
                {errors.title[0]}
              </p>
            )}
          </div>

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

          <div>
            <Label htmlFor="excerpt" className="text-slate-300">
              Extrait
            </Label>
            <textarea
              id="excerpt"
              name="excerpt"
              defaultValue={article?.excerpt ?? ""}
              rows={2}
              className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              placeholder="Résumé court de l'article..."
            />
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
          <TiptapEditor content={content} onChange={setContent} />
          {errors.content && (
            <p className="mt-1 text-sm text-red-400">
              {errors.content[0]}
            </p>
          )}
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
