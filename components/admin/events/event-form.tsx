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
import { TranslateButton } from "@/components/admin/translate-button"
import { createEvent, updateEvent } from "@/lib/actions/events"
import { slugify, DEPARTMENT_OPTIONS, CATEGORY_OPTIONS } from "@/lib/schemas/event"
import type { Event } from "@prisma/client"

type EventFormProps = {
  event?: Event
}

const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return ""
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

export const EventForm = ({ event }: EventFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [slug, setSlug] = useState(event?.slug ?? "")
  const [autoSlug, setAutoSlug] = useState(!event)
  const [featured, setFeatured] = useState(event?.featured ?? false)
  const [accessible, setAccessible] = useState(event?.accessible ?? false)
  const [published, setPublished] = useState(event?.published ?? true)
  const [titleFr, setTitleFr] = useState(event?.titleFr ?? "")
  const [titleEn, setTitleEn] = useState(event?.titleEn ?? "")
  const [descriptionFr, setDescriptionFr] = useState(event?.descriptionFr ?? "")
  const [descriptionEn, setDescriptionEn] = useState(event?.descriptionEn ?? "")
  const [pricingFr, setPricingFr] = useState(event?.pricingFr ?? "")
  const [pricingEn, setPricingEn] = useState(event?.pricingEn ?? "")

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
    if (translations.descriptionEn) setDescriptionEn(translations.descriptionEn)
    if (translations.pricingEn) setPricingEn(translations.pricingEn)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    formData.set("slug", slug)
    formData.set("titleFr", titleFr)
    formData.set("titleEn", titleEn)
    formData.set("descriptionFr", descriptionFr)
    formData.set("descriptionEn", descriptionEn)
    formData.set("pricingFr", pricingFr)
    formData.set("pricingEn", pricingEn)
    formData.set("featured", String(featured))
    formData.set("accessible", String(accessible))
    formData.set("published", String(published))

    const result = event
      ? await updateEvent(event.id, formData)
      : await createEvent(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push("/admin/events")
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
        <Link href="/admin/events">
          <Button type="button" variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {event ? "Mettre à jour" : "Créer l'événement"}
        </Button>
      </div>

      {/* Basic Info with i18n tabs */}
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
                <Label htmlFor="descriptionFr" className="text-slate-300">
                  Description *
                </Label>
                <textarea
                  id="descriptionFr"
                  name="descriptionFr"
                  value={descriptionFr}
                  onChange={(e) => setDescriptionFr(e.target.value)}
                  required
                  rows={6}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  aria-invalid={!!errors.descriptionFr}
                  aria-describedby={errors.descriptionFr ? "descriptionFr-error" : undefined}
                />
                {errors.descriptionFr && (
                  <p id="descriptionFr-error" className="mt-1 text-sm text-red-400">
                    {errors.descriptionFr[0]}
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="en" className="space-y-4">
              <TranslateButton
                sourceFields={{
                  titleFr,
                  descriptionFr,
                  pricingFr,
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
                <Label htmlFor="descriptionEn" className="text-slate-300">
                  Description
                </Label>
                <textarea
                  id="descriptionEn"
                  name="descriptionEn"
                  value={descriptionEn}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={6}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                  aria-describedby={errors.descriptionEn ? "descriptionEn-error" : undefined}
                />
                {errors.descriptionEn && (
                  <p id="descriptionEn-error" className="mt-1 text-sm text-red-400">
                    {errors.descriptionEn[0]}
                  </p>
                )}
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
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Localisation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="location" className="text-slate-300">
              Lieu *
            </Label>
            <Input
              id="location"
              name="location"
              defaultValue={event?.location ?? ""}
              required
              className="mt-1 border-white/10 bg-white/5 text-white"
              aria-invalid={!!errors.location}
              aria-describedby={errors.location ? "location-error" : undefined}
            />
            {errors.location && (
              <p id="location-error" className="mt-1 text-sm text-red-400">
                {errors.location[0]}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="city" className="text-slate-300">
                Ville *
              </Label>
              <Input
                id="city"
                name="city"
                defaultValue={event?.city ?? ""}
                required
                className="mt-1 border-white/10 bg-white/5 text-white"
                aria-invalid={!!errors.city}
                aria-describedby={errors.city ? "city-error" : undefined}
              />
              {errors.city && (
                <p id="city-error" className="mt-1 text-sm text-red-400">
                  {errors.city[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="postalCode" className="text-slate-300">
                Code postal *
              </Label>
              <Input
                id="postalCode"
                name="postalCode"
                defaultValue={event?.postalCode ?? ""}
                required
                className="mt-1 border-white/10 bg-white/5 text-white"
                aria-invalid={!!errors.postalCode}
                aria-describedby={errors.postalCode ? "postalCode-error" : undefined}
              />
              {errors.postalCode && (
                <p id="postalCode-error" className="mt-1 text-sm text-red-400">
                  {errors.postalCode[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="department" className="text-slate-300">
                Département *
              </Label>
              <select
                id="department"
                name="department"
                defaultValue={event?.department ?? ""}
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                aria-invalid={!!errors.department}
                aria-describedby={errors.department ? "department-error" : undefined}
              >
                <option value="" className="bg-slate-900">
                  Sélectionner...
                </option>
                {DEPARTMENT_OPTIONS.map((dept) => (
                  <option key={dept.value} value={dept.value} className="bg-slate-900">
                    {dept.label}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p id="department-error" className="mt-1 text-sm text-red-400">
                  {errors.department[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="category" className="text-slate-300">
                Catégorie *
              </Label>
              <select
                id="category"
                name="category"
                defaultValue={event?.category ?? ""}
                required
                className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                aria-invalid={!!errors.category}
                aria-describedby={errors.category ? "category-error" : undefined}
              >
                <option value="" className="bg-slate-900">
                  Sélectionner...
                </option>
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat.value} value={cat.value} className="bg-slate-900">
                    {cat.label}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p id="category-error" className="mt-1 text-sm text-red-400">
                  {errors.category[0]}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="latitude" className="text-slate-300">
                Latitude
              </Label>
              <Input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                defaultValue={event?.latitude ?? ""}
                className="mt-1 border-white/10 bg-white/5 text-white"
                aria-describedby={errors.latitude ? "latitude-error" : undefined}
              />
              {errors.latitude && (
                <p id="latitude-error" className="mt-1 text-sm text-red-400">
                  {errors.latitude[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="longitude" className="text-slate-300">
                Longitude
              </Label>
              <Input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                defaultValue={event?.longitude ?? ""}
                className="mt-1 border-white/10 bg-white/5 text-white"
                aria-describedby={errors.longitude ? "longitude-error" : undefined}
              />
              {errors.longitude && (
                <p id="longitude-error" className="mt-1 text-sm text-red-400">
                  {errors.longitude[0]}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dates & Times */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Dates et horaires</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="dateStart" className="text-slate-300">
                Date de début *
              </Label>
              <Input
                id="dateStart"
                name="dateStart"
                type="date"
                defaultValue={formatDateForInput(event?.dateStart)}
                required
                className="mt-1 border-white/10 bg-white/5 text-white"
                aria-invalid={!!errors.dateStart}
                aria-describedby={errors.dateStart ? "dateStart-error" : undefined}
              />
              {errors.dateStart && (
                <p id="dateStart-error" className="mt-1 text-sm text-red-400">
                  {errors.dateStart[0]}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="dateEnd" className="text-slate-300">
                Date de fin
              </Label>
              <Input
                id="dateEnd"
                name="dateEnd"
                type="date"
                defaultValue={formatDateForInput(event?.dateEnd)}
                className="mt-1 border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="timeStart" className="text-slate-300">
                Heure de début
              </Label>
              <Input
                id="timeStart"
                name="timeStart"
                type="time"
                defaultValue={event?.timeStart ?? ""}
                className="mt-1 border-white/10 bg-white/5 text-white"
              />
            </div>

            <div>
              <Label htmlFor="timeEnd" className="text-slate-300">
                Heure de fin
              </Label>
              <Input
                id="timeEnd"
                name="timeEnd"
                type="time"
                defaultValue={event?.timeEnd ?? ""}
                className="mt-1 border-white/10 bg-white/5 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Practical Info */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Informations pratiques</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs defaultValue="fr">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="fr">Français</TabsTrigger>
              <TabsTrigger value="en">English</TabsTrigger>
            </TabsList>

            <TabsContent value="fr">
              <div>
                <Label htmlFor="pricingFr" className="text-slate-300">
                  Tarification
                </Label>
                <Input
                  id="pricingFr"
                  name="pricingFr"
                  value={pricingFr}
                  onChange={(e) => setPricingFr(e.target.value)}
                  placeholder="Gratuit, 5€, etc."
                  className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                />
              </div>
            </TabsContent>

            <TabsContent value="en">
              <div>
                <Label htmlFor="pricingEn" className="text-slate-300">
                  Pricing
                </Label>
                <Input
                  id="pricingEn"
                  name="pricingEn"
                  value={pricingEn}
                  onChange={(e) => setPricingEn(e.target.value)}
                  placeholder="Free, 5€, etc."
                  className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
                />
              </div>
            </TabsContent>
          </Tabs>

          <div>
            <Label htmlFor="organizer" className="text-slate-300">
              Organisateur
            </Label>
            <Input
              id="organizer"
              name="organizer"
              defaultValue={event?.organizer ?? ""}
              className="mt-1 border-white/10 bg-white/5 text-white"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="email" className="text-slate-300">
                Email de contact
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={event?.email ?? ""}
                className="mt-1 border-white/10 bg-white/5 text-white"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="text-slate-300">
                Téléphone
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={event?.phone ?? ""}
                className="mt-1 border-white/10 bg-white/5 text-white"
              />
            </div>

            <div>
              <Label htmlFor="website" className="text-slate-300">
                Site web
              </Label>
              <Input
                id="website"
                name="website"
                type="url"
                defaultValue={event?.website ?? ""}
                placeholder="https://..."
                className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Image</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="coverImage" className="text-slate-300">
              URL de l&apos;image de couverture
            </Label>
            <Input
              id="coverImage"
              name="coverImage"
              defaultValue={event?.coverImage ?? ""}
              placeholder="https://..."
              className="mt-1 border-white/10 bg-white/5 text-white placeholder:text-slate-500"
            />
            <p className="mt-1 text-xs text-slate-500">
              L&apos;upload vers Vercel Blob sera disponible prochainement.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Toggles */}
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 p-3 transition-colors hover:bg-white/5">
            <div>
              <p className="font-medium text-white">À la une</p>
              <p className="text-sm text-slate-400">
                Afficher cet événement dans la section &quot;À la une&quot; de la page d&apos;accueil
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={featured}
              onClick={() => setFeatured(!featured)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                featured ? "bg-amber-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                  featured ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 p-3 transition-colors hover:bg-white/5">
            <div>
              <p className="font-medium text-white">Accessible PMR</p>
              <p className="text-sm text-slate-400">
                Cet événement est accessible aux personnes à mobilité réduite
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={accessible}
              onClick={() => setAccessible(!accessible)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                accessible ? "bg-amber-500" : "bg-slate-600"
              }`}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                  accessible ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </label>

          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-white/10 p-3 transition-colors hover:bg-white/5">
            <div>
              <p className="font-medium text-white">Publié</p>
              <p className="text-sm text-slate-400">
                Rendre cet événement visible sur le site public
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

      {/* Submit */}
      <div className="flex justify-end gap-3">
        <Link href="/admin/events">
          <Button type="button" variant="ghost">
            Annuler
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {event ? "Mettre à jour" : "Créer l'événement"}
        </Button>
      </div>
    </form>
  )
}
