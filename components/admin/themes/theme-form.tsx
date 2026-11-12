"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Link } from "@/lib/i18n/routing"
import { ArrowLeft, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ImageUpload } from "@/components/admin/image-upload"
import { createTheme, updateTheme } from "@/lib/actions/themes"
import { slugify } from "@/lib/schemas/event"
import { DEFAULT_PIN_COLOR } from "@/lib/themes/marker"
import { SKINS } from "@/lib/skins/registry"
import type { Theme } from "@prisma/client"

type ThemeFormProps = {
  theme?: Theme
}

const FIELD_CLASS = "mt-1 border-white/10 bg-white/5 text-white"

const FieldError = ({ id, messages }: { id: string; messages?: string[] }) =>
  messages?.length ? (
    <p id={`${id}-error`} className="mt-1 text-sm text-red-400">
      {messages[0]}
    </p>
  ) : null

export const ThemeForm = ({ theme }: ThemeFormProps) => {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [nameFr, setNameFr] = useState(theme?.nameFr ?? "")
  const [slug, setSlug] = useState(theme?.slug ?? "")
  const [slugEdited, setSlugEdited] = useState(Boolean(theme))
  const [color, setColor] = useState(theme?.color ?? DEFAULT_PIN_COLOR)
  const [markerImage, setMarkerImage] = useState(theme?.markerImage ?? "")
  const [skinLogo, setSkinLogo] = useState(theme?.skinLogo ?? "")
  const [showOnHome, setShowOnHome] = useState(theme?.showOnHome ?? false)

  const describedBy = (field: string) => (errors[field] ? `${field}-error` : undefined)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.set("slug", slug)
    formData.set("color", color)
    formData.set("markerImage", markerImage)
    formData.set("skinLogo", skinLogo)
    formData.set("showOnHome", String(showOnHome))

    setIsSubmitting(true)
    setErrors({})
    const result = theme ? await updateTheme(theme.id, formData) : await createTheme(formData)
    setIsSubmitting(false)

    if (result.success) {
      toast.success(result.message)
      router.push("/admin/themes")
      router.refresh()
      return
    }
    toast.error(result.message)
    if (result.errors) setErrors(result.errors)
  }

  const submitLabel = theme ? "Mettre à jour" : "Créer la thématique"

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <Button asChild variant="ghost">
        <Link href="/admin/themes">
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Retour
        </Link>
      </Button>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Français</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nameFr" className="text-muted-foreground">
              Nom *
            </Label>
            <Input
              id="nameFr"
              name="nameFr"
              value={nameFr}
              onChange={(e) => {
                setNameFr(e.target.value)
                if (!slugEdited) setSlug(slugify(e.target.value))
              }}
              required
              className={FIELD_CLASS}
              aria-invalid={!!errors.nameFr}
              aria-describedby={describedBy("nameFr")}
            />
            <FieldError id="nameFr" messages={errors.nameFr} />
          </div>
          <div>
            <Label htmlFor="descriptionFr" className="text-muted-foreground">
              Présentation (accueil)
            </Label>
            <Textarea
              id="descriptionFr"
              name="descriptionFr"
              defaultValue={theme?.descriptionFr ?? ""}
              rows={3}
              className={FIELD_CLASS}
              aria-invalid={!!errors.descriptionFr}
              aria-describedby={describedBy("descriptionFr")}
            />
            <FieldError id="descriptionFr" messages={errors.descriptionFr} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5" lang="en">
        <CardHeader>
          <CardTitle className="text-white">English</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nameEn" className="text-muted-foreground">
              Name
            </Label>
            <Input
              id="nameEn"
              name="nameEn"
              defaultValue={theme?.nameEn ?? ""}
              className={FIELD_CLASS}
              aria-invalid={!!errors.nameEn}
              aria-describedby={describedBy("nameEn")}
            />
            <FieldError id="nameEn" messages={errors.nameEn} />
          </div>
          <div>
            <Label htmlFor="descriptionEn" className="text-muted-foreground">
              Introduction (home page)
            </Label>
            <Textarea
              id="descriptionEn"
              name="descriptionEn"
              defaultValue={theme?.descriptionEn ?? ""}
              rows={3}
              className={FIELD_CLASS}
              aria-invalid={!!errors.descriptionEn}
              aria-describedby={describedBy("descriptionEn")}
            />
            <FieldError id="descriptionEn" messages={errors.descriptionEn} />
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Affichage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="slug" className="text-muted-foreground">
              Slug (adresse du filtre) *
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value)
                setSlugEdited(true)
              }}
              required
              className={FIELD_CLASS}
              aria-invalid={!!errors.slug}
              aria-describedby={describedBy("slug") ?? "slug-hint"}
            />
            <p id="slug-hint" className="text-muted-foreground mt-1 text-xs">
              /evenements?theme={slug || "…"}
            </p>
            <FieldError id="slug" messages={errors.slug} />
          </div>

          <div className="flex flex-wrap items-end gap-4">
            <div>
              <Label htmlFor="color" className="text-muted-foreground">
                Couleur
              </Label>
              <input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="mt-1 block h-11 w-16 cursor-pointer rounded-md border border-white/10 bg-transparent"
                aria-describedby={describedBy("color")}
              />
            </div>
            <div>
              <Label htmlFor="order" className="text-muted-foreground">
                Ordre d&apos;affichage
              </Label>
              <Input
                id="order"
                name="order"
                type="number"
                min="0"
                defaultValue={theme?.order ?? 0}
                className={`${FIELD_CLASS} w-28`}
              />
            </div>
          </div>
          <FieldError id="color" messages={errors.color} />

          <div>
            <p className="text-muted-foreground mb-2 text-sm font-medium">
              Marqueur de carte / emblème
            </p>
            <p className="text-muted-foreground mb-2 text-xs">
              Image carrée ou en forme d&apos;épingle, fond transparent. Sans image, les épingles
              prennent la couleur de la thématique.
            </p>
            <ImageUpload value={markerImage} onChange={setMarkerImage} preset="logo" />
            <FieldError id="markerImage" messages={errors.markerImage} />
          </div>

          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-white/10 p-3">
            <input
              type="checkbox"
              checked={showOnHome}
              onChange={(e) => setShowOnHome(e.target.checked)}
              className="size-5 accent-amber-500"
            />
            <span>
              <span className="block font-medium text-white">Section sur l&apos;accueil</span>
              <span className="text-muted-foreground block text-sm">
                Présente la thématique et ses événements de l&apos;édition sur la page
                d&apos;accueil.
              </span>
            </span>
          </label>
        </CardContent>
      </Card>

      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">Période et habillage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="years" className="text-muted-foreground">
              Années d&apos;affichage
            </Label>
            <Input
              id="years"
              name="years"
              defaultValue={theme?.years.join(", ") ?? ""}
              placeholder="2027"
              inputMode="numeric"
              className={`${FIELD_CLASS} max-w-xs`}
              aria-invalid={!!errors.years}
              aria-describedby={["years-hint", describedBy("years")].filter(Boolean).join(" ")}
            />
            <p id="years-hint" className="text-muted-foreground mt-1 text-xs">
              Vide = toutes les éditions. Sinon, la thématique (filtre, accueil, épingles,
              habillage) n&apos;apparaît que les années indiquées, par exemple « 2027 » ou « 2027,
              2028 ».
            </p>
            <FieldError id="years" messages={errors.years} />
          </div>

          <div>
            <Label htmlFor="skin" className="text-muted-foreground">
              Habillage du site
            </Label>
            <select
              id="skin"
              name="skin"
              defaultValue={theme?.skin ?? ""}
              className="mt-1 block h-11 w-full max-w-md rounded-md border border-white/10 bg-white/5 px-3 text-white"
              aria-invalid={!!errors.skin}
              aria-describedby={["skin-hint", describedBy("skin")].filter(Boolean).join(" ")}
            >
              <option value="" className="bg-slate-900">
                Aucun habillage
              </option>
              {Object.entries(SKINS).map(([key, label]) => (
                <option key={key} value={key} className="bg-slate-900">
                  {label}
                </option>
              ))}
            </select>
            <p id="skin-hint" className="text-muted-foreground mt-1 text-xs">
              Décor appliqué à tout le site public tant que la thématique est affichée. Il disparaît
              de lui-même hors des années indiquées.
            </p>
            <FieldError id="skin" messages={errors.skin} />
          </div>

          <div role="group" aria-labelledby="skin-logo-title">
            <p id="skin-logo-title" className="text-muted-foreground mb-2 text-sm font-medium">
              Logo de l&apos;habillage
            </p>
            <p className="text-muted-foreground mb-2 text-xs">
              Affiché dans le bandeau en haut du site, à côté du titre. Le logo fourni est un
              exemple : remplacez-le par le logo officiel quand il est disponible. Sans image,
              l&apos;exemple est utilisé.
            </p>
            <ImageUpload value={skinLogo} onChange={setSkinLogo} preset="logo" />
            <FieldError id="skinLogo" messages={errors.skinLogo} />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button asChild variant="ghost">
          <Link href="/admin/themes">Annuler</Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
