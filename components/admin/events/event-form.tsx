"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useLocale } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/admin/image-upload"
import { AddressAutocomplete } from "@/components/admin/address-autocomplete"
import { PublishWizard } from "@/components/admin/publish/publish-wizard"
import { FormActionBar } from "@/components/admin/shared/form-action-bar"
import { TiptapEditor } from "@/components/admin/tiptap-editor"
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
  const locale = useLocale()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [formLocale, setFormLocale] = useState<"fr" | "en">("fr")
  const [slug, setSlug] = useState(event?.slug ?? "")
  const [autoSlug, setAutoSlug] = useState(!event)
  const [featured, setFeatured] = useState(event?.featured ?? false)
  const [accessible, setAccessible] = useState(event?.accessible ?? false)
  const [published, setPublished] = useState(event?.published ?? false)
  const [titleFr, setTitleFr] = useState(event?.titleFr ?? "")
  const [titleEn, setTitleEn] = useState(event?.titleEn ?? "")
  const [descriptionFr, setDescriptionFr] = useState(event?.descriptionFr ?? "")
  const [descriptionEn, setDescriptionEn] = useState(event?.descriptionEn ?? "")
  const [pricingFr, setPricingFr] = useState(event?.pricingFr ?? "")
  const [pricingEn, setPricingEn] = useState(event?.pricingEn ?? "")
  const [location, setLocation] = useState(event?.location ?? "")
  const [city, setCity] = useState(event?.city ?? "")
  const [postalCode, setPostalCode] = useState(event?.postalCode ?? "")
  const [department, setDepartment] = useState(event?.department ?? "")
  const [latitude, setLatitude] = useState(event?.latitude ?? 0)
  const [longitude, setLongitude] = useState(event?.longitude ?? 0)
  const [showPublishWizard, setShowPublishWizard] = useState(false)
  const [publishingFields, setPublishingFields] = useState<Record<string, string>>({})
  const [coverImage, setCoverImage] = useState(event?.coverImage ?? "")

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

  const handleTranslated = (translations: Record<string, string>) => {
    if (translations.titleEn) setTitleEn(translations.titleEn)
    if (translations.descriptionEn) setDescriptionEn(translations.descriptionEn)
    if (translations.pricingEn) setPricingEn(translations.pricingEn)
  }

  const handlePublishClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPublishingFields({
      titleFr,
      descriptionFr,
      pricingFr,
    })
    setShowPublishWizard(true)
  }

  const handleWizardComplete = async (translatedFields?: Record<string, string>) => {
    setShowPublishWizard(false)

    const newTitleEn = translatedFields?.title || titleEn
    const newDescriptionEn = translatedFields?.description || descriptionEn
    const newPricingEn = translatedFields?.pricing || pricingEn

    if (translatedFields?.title) setTitleEn(newTitleEn)
    if (translatedFields?.description) setDescriptionEn(newDescriptionEn)
    if (translatedFields?.pricing) setPricingEn(newPricingEn)

    const formData = new FormData()
    formData.set("slug", slug)
    formData.set("titleFr", titleFr)
    formData.set("titleEn", newTitleEn)
    formData.set("descriptionFr", descriptionFr)
    formData.set("descriptionEn", newDescriptionEn)
    formData.set("pricingFr", pricingFr)
    formData.set("pricingEn", newPricingEn)
    formData.set("location", location)
    formData.set("city", city)
    formData.set("postalCode", postalCode)
    formData.set("department", department)
    formData.set("latitude", latitude != null ? String(latitude) : "")
    formData.set("longitude", longitude != null ? String(longitude) : "")
    formData.set("coverImage", coverImage)
    formData.set("featured", String(featured))
    formData.set("accessible", String(accessible))
    formData.set("published", String(true))

    const categoryInput = document.querySelector<HTMLSelectElement>('[name="category"]')
    const organizerInput = document.querySelector<HTMLInputElement>('[name="organizer"]')
    const emailInput = document.querySelector<HTMLInputElement>('[name="email"]')
    const phoneInput = document.querySelector<HTMLInputElement>('[name="phone"]')
    const websiteInput = document.querySelector<HTMLInputElement>('[name="website"]')
    const dateStartInput = document.querySelector<HTMLInputElement>('[name="dateStart"]')
    const dateEndInput = document.querySelector<HTMLInputElement>('[name="dateEnd"]')
    const timeStartInput = document.querySelector<HTMLInputElement>('[name="timeStart"]')
    const timeEndInput = document.querySelector<HTMLInputElement>('[name="timeEnd"]')

    if (categoryInput?.value) formData.set("category", categoryInput.value)
    if (organizerInput?.value) formData.set("organizer", organizerInput.value)
    if (emailInput?.value) formData.set("email", emailInput.value)
    if (phoneInput?.value) formData.set("phone", phoneInput.value)
    if (websiteInput?.value) formData.set("website", websiteInput.value)
    if (dateStartInput?.value) formData.set("dateStart", dateStartInput.value)
    if (dateEndInput?.value) formData.set("dateEnd", dateEndInput.value)
    if (timeStartInput?.value) formData.set("timeStart", timeStartInput.value)
    if (timeEndInput?.value) formData.set("timeEnd", timeEndInput.value)

    setIsSubmitting(true)
    setErrors({})

    const result = event ? await updateEvent(event.id, formData) : await createEvent(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push("/admin/events")
      router.refresh()
    } else {
      if (result.errors) {
        setErrors(result.errors)
        const errorList = Object.entries(result.errors)
          .map(([, msgs]) => msgs.join(", "))
          .join(" • ")
        toast.error(`${result.message} — ${errorList}`, { duration: 8000 })
        const firstErrorField = Object.keys(result.errors)[0]
        const el = document.querySelector(`[name="${firstErrorField}"], [id="${firstErrorField}"]`)
        el?.scrollIntoView({ behavior: "smooth", block: "center" })
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
    formData.set("descriptionFr", descriptionFr)
    formData.set("descriptionEn", descriptionEn)
    formData.set("pricingFr", pricingFr)
    formData.set("pricingEn", pricingEn)
    formData.set("location", location)
    formData.set("city", city)
    formData.set("postalCode", postalCode)
    formData.set("department", department)
    formData.set("latitude", latitude != null ? String(latitude) : "")
    formData.set("longitude", longitude != null ? String(longitude) : "")
    formData.set("coverImage", coverImage)
    formData.set("featured", String(featured))
    formData.set("accessible", String(accessible))
    formData.set("published", String(published))

    const result = event ? await updateEvent(event.id, formData) : await createEvent(formData)

    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push("/admin/events")
      router.refresh()
    } else {
      if (result.errors) {
        setErrors(result.errors)
        const errorList = Object.entries(result.errors)
          .map(([, msgs]) => msgs.join(", "))
          .join(" • ")
        toast.error(`${result.message} — ${errorList}`, { duration: 8000 })
        const firstErrorField = Object.keys(result.errors)[0]
        const el = document.querySelector(`[name="${firstErrorField}"], [id="${firstErrorField}"]`)
        el?.scrollIntoView({ behavior: "smooth", block: "center" })
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
          content={descriptionFr}
          locale="fr"
          contentType="event"
          onComplete={handleWizardComplete}
          onCancel={() => setShowPublishWizard(false)}
        />
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <FormActionBar
          previewUrl={event ? `/${locale}/admin/preview/event/${event.id}` : undefined}
          isPublished={published}
          onTogglePublish={setPublished}
          onTranslate={() => {
            const button = document.querySelector("[data-translate-button]") as HTMLButtonElement
            button?.click()
          }}
          onSubmit={handleSaveClick}
          isSubmitting={isSubmitting}
          saveLabel={event ? "Mettre à jour" : "Créer l'événement"}
          backUrl="/admin/events"
        />

        {/* Basic Info with global i18n toggle */}
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
          <CardContent className="space-y-5">
            {formLocale === "fr" ? (
              <>
                <div>
                  <Label htmlFor="titleFr" className="mb-2 block text-slate-300">
                    Titre *
                  </Label>
                  <Input
                    id="titleFr"
                    name="titleFr"
                    value={titleFr}
                    onChange={handleTitleFrChange}
                    required
                    className="border-white/10 bg-white/5 text-white"
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
                  <Label htmlFor="descriptionFr" className="mb-2 block text-slate-300">
                    Description *
                  </Label>
                  <TiptapEditor content={descriptionFr} onChange={setDescriptionFr} />
                  {errors.descriptionFr && (
                    <p id="descriptionFr-error" className="mt-1 text-sm text-red-400">
                      {errors.descriptionFr[0]}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="titleEn" className="mb-2 block text-slate-300">
                    Title
                  </Label>
                  <Input
                    id="titleEn"
                    name="titleEn"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    className="border-white/10 bg-white/5 text-white"
                    aria-describedby={errors.titleEn ? "titleEn-error" : undefined}
                  />
                  {errors.titleEn && (
                    <p id="titleEn-error" className="mt-1 text-sm text-red-400">
                      {errors.titleEn[0]}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="descriptionEn" className="mb-2 block text-slate-300">
                    Description
                  </Label>
                  <TiptapEditor content={descriptionEn} onChange={setDescriptionEn} />
                  {errors.descriptionEn && (
                    <p id="descriptionEn-error" className="mt-1 text-sm text-red-400">
                      {errors.descriptionEn[0]}
                    </p>
                  )}
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
          </CardContent>
        </Card>

        {/* Location */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Localisation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddressAutocomplete
              onSelect={(result) => {
                setLocation(result.location)
                setCity(result.city)
                setPostalCode(result.postalCode)
                setDepartment(result.department)
                setLatitude(result.latitude)
                setLongitude(result.longitude)
              }}
              defaultValue={location ? `${location}, ${postalCode} ${city}` : ""}
            />
            {errors.location && <p className="mt-1 text-sm text-red-400">{errors.location[0]}</p>}

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="city" className="text-slate-300">
                  Ville
                </Label>
                <Input
                  id="city"
                  name="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="mt-1 border-white/10 bg-white/5 text-white"
                />
              </div>

              <div>
                <Label htmlFor="postalCode" className="text-slate-300">
                  Code postal
                </Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="mt-1 border-white/10 bg-white/5 text-white"
                />
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
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
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
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 focus:outline-none"
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
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
            {formLocale === "fr" ? (
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
            ) : (
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
            )}

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
              <Label className="mb-2 block text-slate-300">Image de couverture</Label>
              <ImageUpload value={coverImage} onChange={setCoverImage} preset="cover" />
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
                  Afficher cet événement dans la section &quot;À la une&quot; de la page
                  d&apos;accueil
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
          </CardContent>
        </Card>

        {/* Hidden inputs for address fields */}
        <input type="hidden" name="location" value={location} />
        <input type="hidden" name="city" value={city} />
        <input type="hidden" name="postalCode" value={postalCode} />
        <input type="hidden" name="department" value={department} />
        <input type="hidden" name="latitude" value={latitude ?? ""} />
        <input type="hidden" name="longitude" value={longitude ?? ""} />
      </form>
    </>
  )
}
