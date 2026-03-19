"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  Search,
  ArrowLeft,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { deleteNews, type AdminNewsListItem } from "@/lib/actions/news"

type AdminNewsPageProps = {
  news: AdminNewsListItem[]
  search?: string
}

export const AdminNewsPage = ({ news, search = "" }: AdminNewsPageProps) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(search)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    router.push(`/admin/news${params.toString() ? `?${params}` : ""}`)
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    const result = await deleteNews(id)
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
            Actualités
          </h1>
          <span className="text-sm text-slate-400">
            ({news.length} article{news.length !== 1 ? "s" : ""})
          </span>
        </div>
        <Link href="/admin/news/new">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel article
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Rechercher par titre..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-slate-500"
            aria-label="Rechercher des articles"
          />
        </div>
      </form>

      {news.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400">
            {search
              ? "Aucun article ne correspond à votre recherche."
              : "Aucun article pour le moment."}
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
                  Date de publication
                </th>
                <th className="px-4 py-3 text-center font-medium text-slate-300">
                  Statut
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {news.map((article) => (
                <tr
                  key={article.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">{article.titleFr}</span>
                    {article.excerptFr && (
                      <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{article.excerptFr}</p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                    {formatDate(article.publishedAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {article.published ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400" aria-label="Publié">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Publié</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-500" aria-label="Brouillon">
                        <EyeOff className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Brouillon</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/news/${article.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Modifier ${article.titleFr}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-red-400 hover:text-red-300"
                              aria-label={`Supprimer ${article.titleFr}`}
                            />
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l&apos;article</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer &quot;{article.titleFr}&quot; ?
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleDelete(article.id)}
                              disabled={isDeleting === article.id}
                            >
                              {isDeleting === article.id ? "Suppression..." : "Supprimer"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
