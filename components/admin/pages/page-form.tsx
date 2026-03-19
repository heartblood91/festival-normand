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
  const [titleFr, setTitleFr] = useState(page?.titleFr ?? "")
  const [titleEn, setTitleEn] = useState(page?.titleEn ?? "")
  const [contentFr, setContentFr] = useState(page?.contentFr ?? "")
  const [contentEn, setContentEn] = useState(page?.contentEn ?? "")

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

  const handleSlugChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isSystemPage) {
        setAutoSlug(false)
        setSlug(e.target.value)
      }
    },
    [isSystemPage]
  )

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
    formData.set("contentFr", contentFr)
    formData.set("contentEn", contentEn)

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
          <Tabs defaultValue="fr">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>

            <TabsContent value="fr">
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
            </TabsContent>

            <TabsContent value="en">
              <TranslateButton
                sourceFields={{
                  titleFr,
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
            </TabsContent>
          </Tabs>

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
