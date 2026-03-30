"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Star,
  Eye,
  EyeOff,
  Accessibility,
  X,
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
import { deleteEvent, bulkDeleteEvents } from "@/lib/actions/events"
import type { AdminEventListItem } from "@/lib/types/admin"
import { AdminFilters, type FilterConfig } from "@/components/admin/shared/admin-filters"
import { AdminPagination } from "@/components/admin/shared/admin-pagination"

type AdminEventsPageProps = {
  items: AdminEventListItem[]
  total: number
  page: number
  totalPages: number
  search?: string
  status?: string
  department?: string
  category?: string
  featured?: string
}

const DEPARTMENT_LABELS: Record<string, string> = {
  CALVADOS: "Calvados",
  EURE: "Eure",
  MANCHE: "Manche",
  ORNE: "Orne",
  SEINE_MARITIME: "Seine-Maritime",
}

const DEPARTMENT_VALUES = [
  { value: "CALVADOS", label: "Calvados" },
  { value: "EURE", label: "Eure" },
  { value: "MANCHE", label: "Manche" },
  { value: "ORNE", label: "Orne" },
  { value: "SEINE_MARITIME", label: "Seine-Maritime" },
]

const CATEGORY_LABELS: Record<string, string> = {
  ILLUMINATIONS: "Illuminations",
  EXPOSITIONS: "Expositions",
  ANIMATIONS: "Animations",
  VISITES: "Visites",
}

const CATEGORY_VALUES = [
  { value: "ILLUMINATIONS", label: "Illuminations" },
  { value: "EXPOSITIONS", label: "Expositions" },
  { value: "ANIMATIONS", label: "Animations" },
  { value: "VISITES", label: "Visites" },
]

export const AdminEventsPage = ({
  items,
  total,
  page,
  totalPages,
  search = "",
  status = "all",
  department = "",
  category = "",
  featured = "",
}: AdminEventsPageProps) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(search)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchQuery) params.set("search", searchQuery)
    if (status && status !== "all") params.set("status", status)
    if (department) params.set("department", department)
    if (category) params.set("category", category)
    params.set("page", "1")
    router.push(`/admin/events${params.toString() ? `?${params}` : ""}`)
  }

  const filterConfigs: FilterConfig[] = [
    {
      key: "status",
      label: "Statut",
      options: [
        { value: "published", label: "Publié" },
        { value: "draft", label: "Brouillon" },
        { value: "depublished", label: "Dépublié" },
      ],
    },
    {
      key: "department",
      label: "Département",
      options: DEPARTMENT_VALUES,
    },
    {
      key: "category",
      label: "Catégorie",
      options: CATEGORY_VALUES,
    },
    {
      key: "featured",
      label: "À la une",
      options: [
        { value: "true", label: "Oui" },
        { value: "false", label: "Non" },
      ],
    },
  ]

  const currentFilterValues = {
    status: status || "all",
    department: department || "",
    featured: featured || "",
    category: category || "",
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    const result = await deleteEvent(id)
    setIsDeleting(null)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(items.map((item) => item.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkDelete = async () => {
    setIsBulkDeleting(true)
    const result = await bulkDeleteEvents(Array.from(selectedIds))
    setIsBulkDeleting(false)

    if (result.success) {
      toast.success(result.message)
      setSelectedIds(new Set())
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
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-amber-500">Événements</h1>
          <p className="mt-1 text-sm text-slate-400">{total} résultat{total !== 1 ? "s" : ""}</p>
        </div>
        <Link href="/admin/events/new">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nouvel événement
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Rechercher par titre, ville ou lieu..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value === "") {
                const params = new URLSearchParams()
                if (status && status !== "all") params.set("status", status)
                if (department) params.set("department", department)
                if (category) params.set("category", category)
                params.set("page", "1")
                router.push(`/admin/events${params.toString() ? `?${params}` : ""}`)
              }
            }}
            className="border-white/10 bg-white/5 pl-10 pr-10 text-white placeholder:text-slate-500"
            aria-label="Rechercher des événements"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                const params = new URLSearchParams()
                if (status && status !== "all") params.set("status", status)
                if (department) params.set("department", department)
                if (category) params.set("category", category)
                params.set("page", "1")
                router.push(`/admin/events${params.toString() ? `?${params}` : ""}`)
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              aria-label="Effacer la recherche"
            >
              ×
            </button>
          )}
        </div>
      </form>

      <AdminFilters
        filters={filterConfigs}
        baseUrl="/admin/events"
        currentValues={currentFilterValues}
      />

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400">
            {search
              ? "Aucun événement ne correspond à votre recherche."
              : "Aucun événement pour le moment."}
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === items.length && items.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 accent-amber-500"
                    aria-label="Sélectionner tous les événements"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">
                  Titre
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-300 md:table-cell">
                  Ville
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-300 lg:table-cell">
                  Département
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-300 md:table-cell">
                  Catégorie
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-300 lg:table-cell">
                  Date
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
              {items.map((event) => (
                <tr
                  key={event.id}
                  className={`border-b border-white/5 transition-colors ${selectedIds.has(event.id) ? "bg-amber-500/10" : "hover:bg-white/5"}`}
                >
                  <td className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(event.id)}
                      onChange={() => handleToggleSelect(event.id)}
                      className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 accent-amber-500"
                      aria-label={`Sélectionner ${event.titleFr}`}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-white">{event.titleFr}</span>
                      {event.featured && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400" aria-label="À la une">
                          <Star className="size-3 fill-amber-400" aria-hidden="true" />
                          À la une
                        </span>
                      )}
                      {event.accessible && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400" aria-label="Accessible PMR">
                          <Accessibility className="size-3" aria-hidden="true" />
                          PMR
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                    {event.city}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                    {DEPARTMENT_LABELS[event.department] || event.department}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                    {CATEGORY_LABELS[event.category] || event.category}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                    {formatDate(event.dateStart)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {event.published ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400" aria-label="Publié">
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Publié</span>
                      </span>
                    ) : event.unpublishedAt ? (
                      <span className="inline-flex items-center gap-1 text-orange-400" aria-label="Dépublié">
                        <EyeOff className="h-3.5 w-3.5" />
                        <span className="hidden md:inline">Dépublié</span>
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
                      <Link href={`/admin/events/${event.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Modifier ${event.titleFr}`}
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
                              aria-label={`Supprimer ${event.titleFr}`}
                            />
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer l&apos;événement</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer &quot;{event.titleFr}&quot; ?
                              Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction
                              variant="destructive"
                              onClick={() => handleDelete(event.id)}
                              disabled={isDeleting === event.id}
                            >
                              {isDeleting === event.id ? "Suppression..." : "Supprimer"}
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

          <AdminPagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl="/admin/events"
            searchParams={{
              search: search || "",
              status: status || "",
              department: department || "",
              category: category || "",
            }}
          />
        </>
      )}

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-xl border border-white/10 bg-slate-900/95 px-6 py-3 shadow-2xl backdrop-blur-xl">
          <span className="text-sm font-medium text-white">
            {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Annuler
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-destructive px-2.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                disabled={isBulkDeleting}
              >
                <Trash2 className="size-3.5" />
                Supprimer
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer les événements</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir supprimer {selectedIds.size} événement{selectedIds.size > 1 ? "s" : ""} ? Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={isBulkDeleting}
                  >
                    {isBulkDeleting ? "Suppression..." : "Supprimer"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  )
}
