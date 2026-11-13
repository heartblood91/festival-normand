"use client"

import { useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useLocale } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AddressAutocomplete } from "@/components/admin/address-autocomplete"
import { TourinsoftBanner } from "@/components/admin/events/tourinsoft-banner"
import { FundraisingSection } from "@/components/admin/events/fundraising-section"
import { PublishWizard, type PublishWizardResult } from "@/components/admin/publish/publish-wizard"
import { FormActionBar } from "@/components/admin/shared/form-action-bar"
import { CoverImageField } from "@/components/admin/shared/cover-image-field"
import { DraftBanner } from "@/components/admin/shared/draft-banner"
import {
  LocaleTabs,
  localePanelProps,
  type FormLocale,
} from "@/components/admin/shared/locale-tabs"
import { useFormDraft } from "@/components/admin/shared/use-form-draft"
import { TiptapEditor } from "@/components/admin/tiptap-editor"
import { createEvent, updateEvent } from "@/lib/actions/events"
import { draftKey } from "@/lib/admin/form-draft"
import { localeTabStatus } from "@/lib/admin/form-status"
import {
  applySpellingCorrections,
  fillMissingTranslations,
  missingTranslationSource,
  needsPublishWizard,
} from "@/lib/admin/publish-flow"
import { translateMissingFields } from "@/lib/admin/translate-missing"
import { slugify, DEPARTMENT_OPTIONS, CATEGORY_OPTIONS } from "@/lib/schemas/event"
import type { ThemeOption } from "@/lib/actions/themes"
import type { FundraisingSuggestionItem } from "@/lib/actions/fundraising"
import type { Event } from "@prisma/client"

type EventFormProps = {
  event?: Event & { themes?: { id: string }[] }
  /** Themes the editor can tick (Millennium…). */
  themes?: ThemeOption[]
  /** yyyy-mm-dd prefilled for a new event: the edition's first night. */
  defaultDateStart?: string
  fundraisingSuggestions?: FundraisingSuggestionItem[]
}

const LOCALE_FIELDS = {
  fr: ["titleFr", "descriptionFr", "pricingFr"],
  en: ["titleEn", "descriptionEn", "pricingEn"],
}

const formatDateForInput = (date: Date | null | undefined): string => {
  if (!date) return ""
  const d = new Date(date)
  return d.toISOString().split("T")[0]
}

const splitIds = (value: string) => value.split(",").filter(Boolean)

export const EventForm = ({
  event,
  themes = [],
  defaultDateStart = "",
  fundraisingSuggestions,
}: EventFormProps) => {
  const router = useRouter()
  const locale = useLocale()
  const formRef = useRef<HTMLFormElement>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [formLocale, setFormLocale] = useState<FormLocale>("fr")
  const [slug, setSlug] = useState(event?.slug ?? "")
  const [autoSlug] = useState(!event)
  const [featured, setFeatured] = useState(event?.featured ?? false)
  const [accessible, setAccessible] = useState(event?.accessible ?? false)
  const wasPublished = event?.published ?? false
  const [published, setPublished] = useState(wasPublished)
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
  const [coverImage, setCoverImage] = useState(event?.coverImage ?? "")
  const [coverAlt, setCoverAlt] = useState({
    fr: event?.coverImageAltFr ?? "",
    en: event?.coverImageAltEn ?? "",
  })
  const [minDateEnd, setMinDateEnd] = useState(
    formatDateForInput(event?.dateStart) || defaultDateStart
  )
  const [restoreCount, setRestoreCount] = useState(0)
  const [themeIds, setThemeIds] = useState<string[]>(event?.themes?.map((theme) => theme.id) ?? [])
  const [fundraising, setFundraising] = useState({
    url: event?.fundraisingUrl ?? "",
    title: event?.fundraisingTitle ?? "",
    image: event?.fundraisingImage ?? "",
  })

  const draftValues: Record<string, string> = {
    slug,
    titleFr,
    titleEn,
    descriptionFr,
    descriptionEn,
    pricingFr,
    pricingEn,
    location,
    city,
    postalCode,
    department,
    latitude: latitude !== null ? String(latitude) : "",
    longitude: longitude !== null ? String(longitude) : "",
    coverImage,
    coverImageAltFr: coverAlt.fr,
    coverImageAltEn: coverAlt.en,
    featured: String(featured),
    accessible: String(accessible),
    themeIds: themeIds.join(","),
    fundraisingUrl: fundraising.url,
    fundraisingTitle: fundraising.title,
    fundraisingImage: fundraising.image,
  }

  const { dirty, draft, restoreDraft, discardDraft, markSaved } = useFormDraft({
    storageKey: draftKey("event", event?.id),
    formRef,
    values: draftValues,
    onRestore: (values) => {
      setSlug(values.slug ?? slug)
      setTitleFr(values.titleFr ?? "")
      setTitleEn(values.titleEn ?? "")
      setDescriptionFr(values.descriptionFr ?? "")
      setDescriptionEn(values.descriptionEn ?? "")
      setPricingFr(values.pricingFr ?? "")
      setPricingEn(values.pricingEn ?? "")
      setLocation(values.location ?? "")
      setCity(values.city ?? "")
      setPostalCode(values.postalCode ?? "")
      setDepartment(values.department ?? "")
      setLatitude(Number(values.latitude) || 0)
      setLongitude(Number(values.longitude) || 0)
      setCoverImage(values.coverImage ?? "")
      setCoverAlt({ fr: values.coverImageAltFr ?? "", en: values.coverImageAltEn ?? "" })
      setFeatured(values.featured === "true")
      setAccessible(values.accessible === "true")
      if (values.themeIds !== undefined) setThemeIds(splitIds(values.themeIds))
      setFundraising({
        url: values.fundraisingUrl ?? "",
        title: values.fundraisingTitle ?? "",
        image: values.fundraisingImage ?? "",
      })
      setMinDateEnd(values.dateStart ?? minDateEnd)
      // Remounts the address search so it shows the restored address.
      setRestoreCount((count) => count + 1)
    },
  })

  const tabStatus = localeTabStatus({ fields: LOCALE_FIELDS, errors, values: draftValues })

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
      ...draftValues,
      published: String(published),
      ...overrides,
    }
    const formData = new FormData(formRef.current)
    Object.entries(fields).forEach(([name, value]) => formData.set(name, value))

    setIsSubmitting(true)
    setErrors({})
    const result = event ? await updateEvent(event.id, formData) : await createEvent(formData)
    setIsSubmitting(false)

    if (result.success) {
      markSaved()
      toast.success(result.message)
      router.push("/admin/events")
      router.refresh()
      return true
    }
    if (result.errors) {
      setErrors(result.errors)
      const failed = localeTabStatus({
        fields: LOCALE_FIELDS,
        errors: result.errors,
        values: draftValues,
      })
      if (failed.en === "error" && failed.fr !== "error") setFormLocale("en")
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
    return false
  }

  const handleWizardComplete = async ({ translations, corrections }: PublishWizardResult) => {
    const correctedTitleFr = applySpellingCorrections(titleFr, corrections)
    const correctedDescriptionFr = applySpellingCorrections(descriptionFr, corrections)
    const english = fillMissingTranslations(
      { title: titleEn, description: descriptionEn, pricing: pricingEn },
      translations
    )
    setTitleFr(correctedTitleFr)
    setDescriptionFr(correctedDescriptionFr)
    setTitleEn(english.title)
    setDescriptionEn(english.description)
    setPricingEn(english.pricing)

    const saved = await save({
      titleFr: correctedTitleFr,
      descriptionFr: correctedDescriptionFr,
      titleEn: english.title,
      descriptionEn: english.description,
      pricingEn: english.pricing,
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
          content={descriptionFr}
          locale="fr"
          contentType="event"
          translationSource={missingTranslationSource({
            title: [titleFr, titleEn],
            description: [descriptionFr, descriptionEn],
            pricing: [pricingFr, pricingEn],
          })}
          onComplete={handleWizardComplete}
          onCancel={handleWizardCancel}
        />
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6 pb-20 md:pb-0">
        <FormActionBar
          previewUrl={event ? `/${locale}/admin/preview/event/${event.id}` : undefined}
          isPublished={published}
          isDirty={dirty}
          onTogglePublish={setPublished}
          ai={{
            title: titleFr,
            content: descriptionFr,
            translateMissing: async () => {
              const filled = await translateMissingFields({
                title: [titleFr, titleEn],
                description: [descriptionFr, descriptionEn],
                pricing: [pricingFr, pricingEn],
              })
              if (filled.title) setTitleEn(filled.title)
              if (filled.description) setDescriptionEn(filled.description)
              if (filled.pricing) setPricingEn(filled.pricing)
              return Object.keys(filled).length
            },
          }}
          onSubmit={handleSaveClick}
          isSubmitting={isSubmitting}
          saveLabel={event ? "Mettre à jour" : "Créer l'événement"}
          backUrl="/admin/events"
        />

        {draft && <DraftBanner draft={draft} onRestore={restoreDraft} onDiscard={discardDraft} />}

        {event?.tourinsoftId && (
          <TourinsoftBanner
            updatedAt={event.tourinsoftUpdatedAt}
            source={{
              title: event.sourceTitleFr,
              description: event.sourceDescriptionFr,
              correctedAt: event.textsCorrectedAt,
            }}
          />
        )}

        {/* Basic Info with global i18n toggle */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-white">Informations générales</CardTitle>
            <LocaleTabs
              value={formLocale}
              onChange={setFormLocale}
              status={tabStatus}
              panelIds={["event-panel-general", "event-panel-pricing"]}
            />
          </CardHeader>
          <CardContent className="space-y-5">
            <div {...localePanelProps("event-panel-general", formLocale)} className="space-y-5">
              {formLocale === "fr" ? (
                <>
                  <div>
                    <Label htmlFor="titleFr" className="text-muted-foreground mb-2 block">
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
                    <Label htmlFor="descriptionFr" className="text-muted-foreground mb-2 block">
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
                    <Label htmlFor="titleEn" className="text-muted-foreground mb-2 block">
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
                    <Label htmlFor="descriptionEn" className="text-muted-foreground mb-2 block">
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
            </div>

            <div>
              <Label htmlFor="slug" className="text-muted-foreground mb-2 block">
                Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                value={slug}
                readOnly
                required
                className="bg-background text-muted-foreground cursor-not-allowed border-white/10 opacity-60"
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
              key={restoreCount}
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
                <Label htmlFor="city" className="text-muted-foreground">
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
                <Label htmlFor="postalCode" className="text-muted-foreground">
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
                <Label htmlFor="department" className="text-muted-foreground">
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
                  <option value="" className="bg-background">
                    Sélectionner...
                  </option>
                  {DEPARTMENT_OPTIONS.map((dept) => (
                    <option key={dept.value} value={dept.value} className="bg-background">
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
                <Label htmlFor="category" className="text-muted-foreground">
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
                  <option value="" className="bg-background">
                    Sélectionner...
                  </option>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <option key={cat.value} value={cat.value} className="bg-background">
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
                <Label htmlFor="dateStart" className="text-muted-foreground">
                  Date de début *
                </Label>
                <Input
                  id="dateStart"
                  name="dateStart"
                  type="date"
                  defaultValue={formatDateForInput(event?.dateStart) || defaultDateStart}
                  onChange={(e) => setMinDateEnd(e.target.value)}
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
                <Label htmlFor="timeStart" className="text-muted-foreground">
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
                <Label htmlFor="dateEnd" className="text-muted-foreground">
                  Date de fin
                </Label>
                <Input
                  id="dateEnd"
                  name="dateEnd"
                  type="date"
                  defaultValue={formatDateForInput(event?.dateEnd)}
                  min={minDateEnd || undefined}
                  className="mt-1 border-white/10 bg-white/5 text-white"
                  aria-invalid={!!errors.dateEnd}
                  aria-describedby={errors.dateEnd ? "dateEnd-error" : undefined}
                />
                {errors.dateEnd && (
                  <p id="dateEnd-error" className="mt-1 text-sm text-red-400">
                    {errors.dateEnd[0]}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="timeEnd" className="text-muted-foreground">
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
            <div {...localePanelProps("event-panel-pricing", formLocale)}>
              {formLocale === "fr" ? (
                <div>
                  <Label htmlFor="pricingFr" className="text-muted-foreground">
                    Tarification
                  </Label>
                  <Input
                    id="pricingFr"
                    name="pricingFr"
                    value={pricingFr}
                    onChange={(e) => setPricingFr(e.target.value)}
                    placeholder="Gratuit, 5€, etc."
                    className="placeholder:text-muted-foreground mt-1 border-white/10 bg-white/5 text-white"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="pricingEn" className="text-muted-foreground">
                    Pricing
                  </Label>
                  <Input
                    id="pricingEn"
                    name="pricingEn"
                    value={pricingEn}
                    onChange={(e) => setPricingEn(e.target.value)}
                    placeholder="Free, 5€, etc."
                    className="placeholder:text-muted-foreground mt-1 border-white/10 bg-white/5 text-white"
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="organizer" className="text-muted-foreground">
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
                <Label htmlFor="email" className="text-muted-foreground">
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
                <Label htmlFor="phone" className="text-muted-foreground">
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
                <Label htmlFor="website" className="text-muted-foreground">
                  Site web
                </Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  defaultValue={event?.website ?? ""}
                  placeholder="https://..."
                  className="placeholder:text-muted-foreground mt-1 border-white/10 bg-white/5 text-white"
                />
              </div>

              <div className="md:col-span-3">
                <Label htmlFor="historyUrl" className="text-muted-foreground">
                  Histoire du lieu
                </Label>
                <Input
                  id="historyUrl"
                  name="historyUrl"
                  type="url"
                  defaultValue={event?.historyUrl ?? ""}
                  placeholder="https://fr.wikipedia.org/wiki/..."
                  className="placeholder:text-muted-foreground mt-1 border-white/10 bg-white/5 text-white"
                  aria-invalid={!!errors.historyUrl}
                  aria-describedby={
                    errors.historyUrl ? "historyUrl-hint historyUrl-error" : "historyUrl-hint"
                  }
                />
                <p id="historyUrl-hint" className="text-muted-foreground mt-1 text-xs">
                  Page Wikipédia ou site officiel du monument. La synchronisation Tourinsoft ne
                  modifie jamais ce lien.
                </p>
                {errors.historyUrl && (
                  <p id="historyUrl-error" className="mt-1 text-sm text-red-400">
                    {errors.historyUrl[0]}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <FundraisingSection
          value={fundraising}
          onChange={setFundraising}
          suggestions={fundraisingSuggestions}
          errors={errors}
        />

        {/* Image */}
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle className="text-white">Image</CardTitle>
          </CardHeader>
          <CardContent>
            <CoverImageField
              value={coverImage}
              onChange={setCoverImage}
              altFr={coverAlt.fr}
              altEn={coverAlt.en}
              onAltChange={setCoverAlt}
              context={titleFr}
              errors={errors}
            />
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
                <p className="text-muted-foreground text-sm">
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
                  featured ? "bg-amber-500" : "bg-muted-foreground/40"
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
                <p className="text-muted-foreground text-sm">
                  Cet événement est accessible aux personnes à mobilité réduite
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={accessible}
                onClick={() => setAccessible(!accessible)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  accessible ? "bg-amber-500" : "bg-muted-foreground/40"
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

        {themes.length > 0 && (
          <Card className="border-white/10 bg-white/5">
            <CardHeader>
              <CardTitle className="text-white">Thématiques</CardTitle>
            </CardHeader>
            <CardContent>
              <fieldset>
                <legend className="text-muted-foreground mb-3 text-sm">
                  Rattacher l&apos;événement à un fil rouge (filtre public, section d&apos;accueil,
                  marqueur de carte).
                </legend>
                <div className="flex flex-wrap gap-2">
                  {themes.map((theme) => (
                    <label
                      key={theme.id}
                      className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white has-[:checked]:border-amber-500/50 has-[:checked]:bg-amber-500/10"
                    >
                      <input
                        type="checkbox"
                        checked={themeIds.includes(theme.id)}
                        onChange={(e) =>
                          setThemeIds((ids) =>
                            e.target.checked
                              ? [...ids, theme.id]
                              : ids.filter((id) => id !== theme.id)
                          )
                        }
                        className="size-4 accent-amber-500"
                      />
                      <span
                        className="size-3 rounded-full"
                        style={{ backgroundColor: theme.color }}
                        aria-hidden="true"
                      />
                      {theme.nameFr}
                    </label>
                  ))}
                </div>
              </fieldset>
            </CardContent>
          </Card>
        )}

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
