"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { ImageUpload } from "@/components/admin/image-upload"
import {
  addAssociation,
  deleteAssociation,
  findSocialLinks,
  saveSocialLinks,
  updateAssociation,
  type EventCommunity,
} from "@/lib/actions/community"
import { MAX_SOCIAL_LINKS } from "@/lib/events/social-links"

type EventCommunityCardProps = {
  eventId: string
  community: EventCommunity
}

const EMPTY_ASSOCIATION = { name: "", url: "", logo: "" }

const SocialLinksSection = ({ eventId, community }: EventCommunityCardProps) => {
  const router = useRouter()
  const [links, setLinks] = useState<string[]>(
    community.socialLinks.length > 0 ? community.socialLinks : [""]
  )
  const [errors, setErrors] = useState<string[]>([])
  const [isSaving, startSaving] = useTransition()
  const [isSearching, startSearching] = useTransition()

  const setLink = (index: number, value: string) =>
    setLinks((current) => current.map((link, i) => (i === index ? value : link)))

  const handleSearch = () =>
    startSearching(async () => {
      const result = await findSocialLinks(eventId)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      const found = (result.links ?? []).filter((link) => !links.includes(link))
      if (found.length > 0) {
        setLinks((current) =>
          [...current.filter((link) => link.trim()), ...found].slice(0, MAX_SOCIAL_LINKS)
        )
      }
      toast.success(result.message)
    })

  const handleSave = () =>
    startSaving(async () => {
      const result = await saveSocialLinks(eventId, links)
      setErrors(result.errors?.socialLinks ?? [])
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      router.refresh()
    })

  return (
    <section aria-labelledby="social-links-title" className="grid gap-4">
      <div>
        <h3 id="social-links-title" className="font-medium text-white">
          Réseaux sociaux
        </h3>
        <p className="text-muted-foreground text-sm">
          Pages officielles du lieu (Facebook, Instagram, YouTube…). Rien n&apos;est affiché sur le
          site si la liste est vide.
        </p>
      </div>
      <ul className="grid gap-2">
        {links.map((link, index) => (
          <li key={index} className="flex items-center gap-2">
            <Label htmlFor={`social-link-${index}`} className="sr-only">
              Lien de réseau social {index + 1}
            </Label>
            <Input
              id={`social-link-${index}`}
              type="url"
              inputMode="url"
              placeholder="https://www.facebook.com/…"
              value={link}
              onChange={(event) => setLink(index, event.target.value)}
              className="min-h-11"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-11 shrink-0 text-red-400 hover:text-red-300"
              aria-label={`Retirer le lien ${index + 1}`}
              onClick={() =>
                setLinks((current) =>
                  current.length > 1 ? current.filter((_, i) => i !== index) : [""]
                )
              }
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Button>
          </li>
        ))}
      </ul>
      {errors.length > 0 ? (
        <ul role="alert" className="grid gap-1 text-sm text-red-400">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={links.length >= MAX_SOCIAL_LINKS}
          onClick={() => setLinks((current) => [...current, ""])}
        >
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
          Ajouter un lien
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={!community.website || isSearching}
          onClick={handleSearch}
        >
          <Search className="mr-1 h-4 w-4" aria-hidden="true" />
          {isSearching ? "Recherche…" : "Chercher sur le site officiel"}
        </Button>
        <Button type="button" className="min-h-11" disabled={isSaving} onClick={handleSave}>
          {isSaving ? "Enregistrement…" : "Enregistrer les réseaux"}
        </Button>
      </div>
      {!community.website ? (
        <p className="text-muted-foreground text-xs">
          Renseignez le site officiel du lieu pour lancer une recherche automatique.
        </p>
      ) : null}
    </section>
  )
}

const AssociationsSection = ({ eventId, community }: EventCommunityCardProps) => {
  const router = useRouter()
  const [form, setForm] = useState(EMPTY_ASSOCIATION)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [isPending, startTransition] = useTransition()

  const resetForm = () => {
    setForm(EMPTY_ASSOCIATION)
    setEditingId(null)
    setErrors({})
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    startTransition(async () => {
      const result = editingId
        ? await updateAssociation(editingId, form)
        : await addAssociation(eventId, form)
      setErrors(result.errors ?? {})
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      resetForm()
      router.refresh()
    })
  }

  const handleDelete = (id: string) =>
    startTransition(async () => {
      const result = await deleteAssociation(id)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      toast.success(result.message)
      if (editingId === id) resetForm()
      router.refresh()
    })

  return (
    <section aria-labelledby="associations-title" className="grid gap-4">
      <div>
        <h3 id="associations-title" className="font-medium text-white">
          Associations partenaires
        </h3>
        <p className="text-muted-foreground text-sm">
          Nom, lien et logo facultatifs ; aucun compte n&apos;est nécessaire.
        </p>
      </div>

      {community.associations.length > 0 ? (
        <ul className="grid gap-2">
          {community.associations.map((association) => (
            <li
              key={association.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2"
            >
              {association.logo ? (
                <Image
                  src={association.logo}
                  alt=""
                  width={40}
                  height={40}
                  unoptimized
                  className="size-10 shrink-0 rounded-sm bg-white object-contain p-0.5"
                />
              ) : null}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{association.name}</p>
                {association.url ? (
                  <p className="text-muted-foreground truncate text-xs">{association.url}</p>
                ) : null}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-11 shrink-0"
                aria-label={`Modifier : ${association.name}`}
                onClick={() => {
                  setEditingId(association.id)
                  setErrors({})
                  setForm({
                    name: association.name,
                    url: association.url ?? "",
                    logo: association.logo ?? "",
                  })
                }}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger
                  render={
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-11 shrink-0 text-red-400 hover:text-red-300"
                      aria-label={`Retirer : ${association.name}`}
                    />
                  }
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Retirer l&apos;association</AlertDialogTitle>
                    <AlertDialogDescription>
                      {association.name} ne sera plus affichée sur la page du site.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => handleDelete(association.id)}
                    >
                      Retirer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </li>
          ))}
        </ul>
      ) : null}

      <form
        onSubmit={handleSubmit}
        aria-label={editingId ? "Modifier l'association" : "Ajouter une association"}
        className="grid gap-3 rounded-lg border border-white/10 p-3 md:grid-cols-2"
      >
        <div className="grid gap-1.5">
          <Label htmlFor="association-name">Nom de l&apos;association</Label>
          <Input
            id="association-name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            aria-invalid={errors.name ? true : undefined}
            aria-describedby={errors.name ? "association-name-error" : undefined}
            className="min-h-11"
            required
          />
          {errors.name ? (
            <p id="association-name-error" className="text-sm text-red-400">
              {errors.name[0]}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="association-url">Lien (facultatif)</Label>
          <Input
            id="association-url"
            type="url"
            inputMode="url"
            placeholder="https://…"
            value={form.url}
            onChange={(event) => setForm({ ...form, url: event.target.value })}
            aria-invalid={errors.url ? true : undefined}
            aria-describedby={errors.url ? "association-url-error" : undefined}
            className="min-h-11"
          />
          {errors.url ? (
            <p id="association-url-error" className="text-sm text-red-400">
              {errors.url[0]}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5 md:col-span-2">
          <p className="text-sm font-medium">Logo (facultatif)</p>
          <ImageUpload
            value={form.logo}
            onChange={(logo) => setForm({ ...form, logo })}
            preset="logo"
          />
          {errors.logo ? <p className="text-sm text-red-400">{errors.logo[0]}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2 md:col-span-2">
          <Button type="submit" className="min-h-11" disabled={isPending}>
            {editingId ? "Enregistrer l'association" : "Ajouter l'association"}
          </Button>
          {editingId ? (
            <Button type="button" variant="ghost" className="min-h-11" onClick={resetForm}>
              Annuler
            </Button>
          ) : null}
        </div>
      </form>
    </section>
  )
}

export const EventCommunityCard = ({ eventId, community }: EventCommunityCardProps) => (
  <Card className="mt-8 border-white/10 bg-white/5">
    <CardHeader>
      <CardTitle className="text-white">Réseaux &amp; associations</CardTitle>
      <CardDescription>
        Enregistrés séparément du formulaire ci-dessus, avec leurs propres boutons.
      </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-8">
      <SocialLinksSection eventId={eventId} community={community} />
      <AssociationsSection eventId={eventId} community={community} />
    </CardContent>
  </Card>
)
