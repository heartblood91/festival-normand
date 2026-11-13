"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { AltTextField } from "@/components/admin/shared/alt-text-field"
import {
  addGalleryPhotos,
  deleteGalleryPhoto,
  reorderGalleryPhotos,
  updateGalleryPhoto,
  type AdminGalleryPhoto,
} from "@/lib/actions/gallery"
import { GALLERY_MAX_YEAR, GALLERY_MIN_YEAR, MAX_GALLERY_UPLOADS } from "@/lib/schemas/gallery"
import { cn } from "@/lib/utils"

type AdminGalleryPageProps = {
  photos: AdminGalleryPhoto[]
  defaultYear: number
}

const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("preset", "gallery")
  const response = await fetch("/api/upload", { method: "POST", body: formData })
  const data = await response.json().catch(() => ({}))
  if (!response.ok || !data.url) throw new Error(data.error || "Le téléversement a échoué")
  return data.url as string
}

const UploadCard = ({ defaultYear }: { defaultYear: number }) => {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [year, setYear] = useState(String(defaultYear))
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return
    const list = Array.from(files).slice(0, MAX_GALLERY_UPLOADS)
    if (files.length > MAX_GALLERY_UPLOADS) {
      toast.warning(`Seules les ${MAX_GALLERY_UPLOADS} premières photos sont envoyées.`)
    }
    const urls: string[] = []
    setProgress({ done: 0, total: list.length })
    // One at a time: large photos are resized on the server, in parallel they could time out.
    for (const file of list) {
      try {
        urls.push(await uploadFile(file))
      } catch (error) {
        toast.error(`${file.name} : ${error instanceof Error ? error.message : "échec"}`)
      }
      setProgress({ done: urls.length, total: list.length })
    }
    if (urls.length) {
      const result = await addGalleryPhotos(Number(year), urls)
      if (result.success) toast.success(result.message)
      else toast.error(result.message)
      router.refresh()
    }
    setProgress(null)
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="text-white">Ajouter des photos</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Les photos sont redimensionnées sans recadrage. Une photo n&apos;apparaît sur le site
          qu&apos;une fois son texte alternatif rédigé.
        </p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          <div className="space-y-2">
            <Label htmlFor="gallery-year" className="text-muted-foreground">
              Édition
            </Label>
            <Input
              id="gallery-year"
              type="number"
              min={GALLERY_MIN_YEAR}
              max={GALLERY_MAX_YEAR}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-11 w-full border-white/10 bg-white/5 text-white md:w-32"
            />
          </div>
          <div className="space-y-2">
            <input
              ref={inputRef}
              id="gallery-files"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              // Not rendered: the button below is the single, labelled control.
              hidden
              onChange={(e) => handleFiles(e.target.files)}
              disabled={!!progress}
            />
            <Button
              type="button"
              className="h-11 w-full md:w-auto"
              disabled={!!progress}
              onClick={() => inputRef.current?.click()}
            >
              {progress ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" />
              )}
              Choisir des photos
            </Button>
          </div>
        </div>
        <p role="status" className="text-sm text-amber-300">
          {progress ? `Téléversement ${progress.done} / ${progress.total}…` : ""}
        </p>
      </CardContent>
    </Card>
  )
}

type PhotoCardProps = {
  photo: AdminGalleryPhoto
  index: number
  count: number
  onMove: (id: string, offset: -1 | 1) => void
  onDeleted: (id: string) => void
}

const PhotoCard = ({ photo, index, count, onMove, onDeleted }: PhotoCardProps) => {
  const router = useRouter()
  const [altFr, setAltFr] = useState(photo.altFr)
  const [altEn, setAltEn] = useState(photo.altEn ?? "")
  const [credit, setCredit] = useState(photo.credit ?? "")
  const [year, setYear] = useState(String(photo.year))
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isSaving, setIsSaving] = useState(false)
  const label = `Photo ${index + 1} de ${photo.year}`
  const isLive = photo.altFr.trim().length > 0

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const result = await updateGalleryPhoto(photo.id, { altFr, altEn, credit, year })
    setIsSaving(false)
    setErrors(result.errors ?? {})
    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else toast.error(result.message)
  }

  const handleDelete = async () => {
    const result = await deleteGalleryPhoto(photo.id)
    if (result.success) {
      toast.success(result.message)
      onDeleted(photo.id)
      router.refresh()
    } else toast.error(result.message)
  }

  return (
    <li className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <div className="relative aspect-[4/3] bg-black/30">
        <Image
          src={photo.url}
          alt=""
          fill
          sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-contain"
          unoptimized
        />
        <span
          className={cn(
            "absolute top-2 left-2 rounded-md px-2 py-1 text-xs font-medium",
            isLive ? "bg-emerald-900/90 text-emerald-200" : "bg-amber-900/90 text-amber-200"
          )}
        >
          {isLive ? "En ligne" : "Texte alternatif manquant"}
        </span>
      </div>
      <form onSubmit={handleSave} className="space-y-4 p-4" aria-label={label}>
        <AltTextField
          id={`alt-fr-${photo.id}`}
          label="Texte alternatif *"
          value={altFr}
          onChange={setAltFr}
          imageUrl={photo.url}
          context={`Galerie « Retour en images » du festival Pierres en Lumières ${photo.year}`}
          error={errors.altFr?.[0]}
        />
        <AltTextField
          id={`alt-en-${photo.id}`}
          label="Texte alternatif (English)"
          value={altEn}
          onChange={setAltEn}
          error={errors.altEn?.[0]}
          lang="en"
        />
        <div className="grid gap-4 md:grid-cols-[1fr_7rem]">
          <div className="space-y-2">
            <Label htmlFor={`credit-${photo.id}`} className="text-muted-foreground">
              Crédit photo
            </Label>
            <Input
              id={`credit-${photo.id}`}
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              maxLength={120}
              placeholder="Nom du photographe"
              className="h-11 border-white/10 bg-white/5 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor={`year-${photo.id}`} className="text-muted-foreground">
              Édition
            </Label>
            <Input
              id={`year-${photo.id}`}
              type="number"
              min={GALLERY_MIN_YEAR}
              max={GALLERY_MAX_YEAR}
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="h-11 border-white/10 bg-white/5 text-white"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" disabled={isSaving} className="h-11">
            {isSaving ? "Enregistrement…" : "Enregistrer"}
          </Button>
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11"
              disabled={index === 0}
              onClick={() => onMove(photo.id, -1)}
              aria-label={`Déplacer avant : ${label}`}
            >
              <ArrowUp className="h-4 w-4" aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11"
              disabled={index === count - 1}
              onClick={() => onMove(photo.id, 1)}
              aria-label={`Déplacer après : ${label}`}
            >
              <ArrowDown className="h-4 w-4" aria-hidden="true" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-11 text-red-400 hover:text-red-300"
                    aria-label={`Supprimer : ${label}`}
                  />
                }
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer la photo</AlertDialogTitle>
                  <AlertDialogDescription>
                    La photo sera retirée de la galerie. Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={handleDelete}>
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </form>
    </li>
  )
}

export const AdminGalleryPage = ({ photos: initialPhotos, defaultYear }: AdminGalleryPageProps) => {
  const router = useRouter()
  const [photos, setPhotos] = useState(initialPhotos)
  const [syncedFrom, setSyncedFrom] = useState(initialPhotos)
  // Server refreshes (after an upload or a save) replace the local copy.
  if (syncedFrom !== initialPhotos) {
    setSyncedFrom(initialPhotos)
    setPhotos(initialPhotos)
  }

  const years = [...new Set(photos.map((photo) => photo.year))].sort((a, b) => b - a)
  const drafts = photos.filter((photo) => !photo.altFr.trim()).length

  const handleMove = async (year: number, id: string, offset: -1 | 1) => {
    const group = photos.filter((photo) => photo.year === year)
    const from = group.findIndex((photo) => photo.id === id)
    const to = from + offset
    if (to < 0 || to >= group.length) return
    const reordered = [...group]
    ;[reordered[from], reordered[to]] = [reordered[to], reordered[from]]
    const previous = photos
    setPhotos([...photos.filter((photo) => photo.year !== year), ...reordered])
    const result = await reorderGalleryPhotos(
      year,
      reordered.map((photo) => photo.id)
    )
    if (!result.success) {
      toast.error(result.message)
      setPhotos(previous)
    } else router.refresh()
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8">
      <div className="flex flex-wrap items-baseline gap-x-3">
        <h1 className="font-serif text-2xl font-bold text-amber-500">Retour en images</h1>
        <span className="text-muted-foreground text-sm">
          ({photos.length} photo{photos.length !== 1 ? "s" : ""}
          {drafts ? `, ${drafts} à compléter` : ""})
        </span>
      </div>

      <UploadCard defaultYear={defaultYear} />

      {years.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-muted-foreground">
            Aucune photo pour le moment. La galerie reste invisible sur le site tant qu&apos;elle
            est vide.
          </p>
        </div>
      ) : (
        years.map((year) => {
          const group = photos.filter((photo) => photo.year === year)
          return (
            <section key={year} aria-labelledby={`gallery-year-${year}`} className="space-y-4">
              <h2 id={`gallery-year-${year}`} className="font-serif text-xl text-white">
                Édition {year}{" "}
                <span className="text-muted-foreground text-sm">
                  ({group.length} photo{group.length !== 1 ? "s" : ""})
                </span>
              </h2>
              <ul className="grid gap-4 lg:grid-cols-2">
                {group.map((photo, index) => (
                  <PhotoCard
                    key={photo.id}
                    photo={photo}
                    index={index}
                    count={group.length}
                    onMove={(id, offset) => handleMove(year, id, offset)}
                    onDeleted={(id) => setPhotos((list) => list.filter((p) => p.id !== id))}
                  />
                ))}
              </ul>
            </section>
          )
        })
      )}
    </div>
  )
}
