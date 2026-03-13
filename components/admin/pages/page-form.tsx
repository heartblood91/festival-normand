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
import { createPage, updatePage } from "@/lib/actions/pages"
import { slugify } from "@/lib/schemas/event"
import type { Page } from "@prisma/client"

const SYSTEM_SLUGS = ["festival", "inscription", "mentions-legales"]

type PageFormProps = {
  page?: Page
}

export const PageForm = ({ page }: PageFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [slug, setSlug] = useState(page?.slug ?? "")
  const [autoSlug, setAutoSlug] = useState(!page)
  const [content, setContent] = useState(page?.content ?? "")

  const isSystemPage = page ? SYSTEM_SLUGS.includes(page.slug) : false

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (autoSlug && !isSystemPage) {
        setSlug(slugify(e.target.value))
      }
    },
    [autoSlug, isSystemPage]
  )

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isSystemPage) {
        setAutoSlug(false)
        setSlug(e.target.value)
      }
    },
    [isSystemPage]
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    formData.set("slug", slug)
    formData.set("content", content)

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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/pages">
          <Button type="button" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {page ? "Mettre à jour" : "Créer la page"}
        </Button>
      </div>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-slate-300">
              Titre *
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={page?.title ?? ""}
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
              Slug {isSystemPage && "(lecture seule pour les pages système)"}
            </Label>
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={handleSlugChange}
              readOnly={isSystemPage}
              required
              className={`mt-1 border-white/10 bg-white/5 text-white ${isSystemPage ? "cursor-not-allowed opacity-60" : ""}`}
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
          <TiptapEditor content={content} onChange={setContent} />
          {errors.content && (
            <p className="mt-1 text-sm text-red-400">
              {errors.content[0]}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Link href="/admin/pages">
          <Button type="button" variant="ghost">
            Annuler
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {page ? "Mettre à jour" : "Créer la page"}
        </Button>
      </div>
    </form>
  )
}
