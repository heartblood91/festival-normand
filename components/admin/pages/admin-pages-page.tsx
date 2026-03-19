"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  Lock,
} from "lucide-react"
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
import { deletePage, type AdminPageListItem } from "@/lib/actions/pages"

const SYSTEM_SLUGS = ["festival", "inscription", "mentions-legales"]

type AdminPagesPageProps = {
  pages: AdminPageListItem[]
}

export const AdminPagesPage = ({ pages }: AdminPagesPageProps) => {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    const result = await deletePage(id)
    setIsDeleting(null)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="icon" aria-label="Retour au tableau de bord">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-amber-500">
            Pages
          </h1>
          <span className="text-sm text-slate-400">
            ({pages.length} page{pages.length !== 1 ? "s" : ""})
          </span>
        </div>
        <Link href="/admin/pages/new">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nouvelle page
          </Button>
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400">
            Aucune page pour le moment.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Titre
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-300 md:table-cell">
                  Slug
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-300 md:table-cell">
                  Dernière modification
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {pages.map((page) => {
                const isSystem = SYSTEM_SLUGS.includes(page.slug)
                return (
                  <tr
                    key={page.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{page.titleFr}</span>
                        {isSystem && (
                          <Lock
                            className="h-3.5 w-3.5 text-slate-500"
                            aria-label="Page système"
                          />
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      /{page.slug}
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      {formatDate(page.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/admin/pages/${page.id}/edit`}>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            aria-label={`Modifier ${page.titleFr}`}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                        {!isSystem && (
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-red-400 hover:text-red-300"
                                  aria-label={`Supprimer ${page.title}`}
                                />
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer la page</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer &quot;{page.titleFr}&quot; ?
                                  Cette action est irréversible.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  variant="destructive"
                                  onClick={() => handleDelete(page.id)}
                                  disabled={isDeleting === page.id}
                                >
                                  {isDeleting === page.id ? "Suppression..." : "Supprimer"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
