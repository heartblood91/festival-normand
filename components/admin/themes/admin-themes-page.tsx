"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Link } from "@/lib/i18n/routing"
import { Home, Pencil, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
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
import { deleteTheme, type AdminThemeListItem } from "@/lib/actions/themes"

type AdminThemesPageProps = {
  themes: AdminThemeListItem[]
}

const eventCount = (count: number) => `${count} événement${count > 1 ? "s" : ""}`

export const AdminThemesPage = ({ themes }: AdminThemesPageProps) => {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const result = await deleteTheme(id)
    setDeletingId(null)
    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-amber-500">Thématiques</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Fils rouges transverses (ex. Millénaire) : filtre public, section d&apos;accueil et
            marqueur sur la carte.
          </p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link href="/admin/themes/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Nouvelle thématique
          </Link>
        </Button>
      </div>

      {themes.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-muted-foreground">Aucune thématique pour le moment.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {themes.map((theme) => (
            <li
              key={theme.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
            >
              {theme.markerImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={theme.markerImage} alt="" className="h-10 w-8 shrink-0 object-contain" />
              ) : (
                <span
                  className="h-4 w-4 shrink-0 rounded-full border-2 border-white"
                  style={{ backgroundColor: theme.color }}
                  aria-hidden="true"
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-medium break-words text-white">{theme.nameFr}</p>
                <p className="text-muted-foreground flex flex-wrap items-center gap-x-3 text-xs">
                  <span>{eventCount(theme._count.events)}</span>
                  {theme.showOnHome && (
                    <span className="inline-flex items-center gap-1 text-amber-400">
                      <Home className="h-3 w-3" aria-hidden="true" />
                      Sur l&apos;accueil
                    </span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  className="size-11"
                  aria-label={`Modifier ${theme.nameFr}`}
                >
                  <Link href={`/admin/themes/${theme.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-11 text-red-400 hover:text-red-300"
                        aria-label={`Supprimer ${theme.nameFr}`}
                      />
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer la thématique</AlertDialogTitle>
                      <AlertDialogDescription>
                        « {theme.nameFr} » sera retirée de {eventCount(theme._count.events)}. Les
                        événements eux-mêmes sont conservés.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => handleDelete(theme.id)}
                        disabled={deletingId === theme.id}
                      >
                        Supprimer
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
