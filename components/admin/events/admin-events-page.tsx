"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  Search,
  Pencil,
  Star,
  StarOff,
  Eye,
  EyeOff,
  Accessibility,
  RefreshCw,
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
import {
  publishEvents,
  setEventsFeatured,
  unpublishEvents,
  type EventActionResult,
} from "@/lib/actions/events"
import { buildListUrl, type EventListParams } from "@/lib/admin/event-list"
import type { AdminEventListItem } from "@/lib/types/admin"
import { AdminFilters, type FilterConfig } from "@/components/admin/shared/admin-filters"
import { AdminPagination } from "@/components/admin/shared/admin-pagination"

type AdminEventsPageProps = {
  items: AdminEventListItem[]
  total: number
  page: number
  totalPages: number
  params: EventListParams
}

const BASE_URL = "/admin/events"

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
  params,
}: AdminEventsPageProps) => {
  const router = useRouter()
  const search = params.search ?? ""
  const [searchQuery, setSearchQuery] = useState(search)
  const [isUnpublishing, setIsUnpublishing] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkAction, setBulkAction] = useState<string | null>(null)

  const listUrl = (changes: Record<string, string | number | undefined>) =>
    buildListUrl(BASE_URL, params, changes)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(listUrl({ search: searchQuery.trim() }))
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
      key: "source",
      label: "Source",
      options: [
        { value: "tourinsoft", label: "Tourinsoft" },
        { value: "manual", label: "Saisie manuelle" },
      ],
    },
    {
      key: "featured",
      label: "À la une",
      options: [
        { value: "true", label: "Oui" },
        { value: "false", label: "Non" },
      ],
    },
    {
      key: "when",
      label: "Période",
      options: [
        { value: "upcoming", label: "À venir" },
        { value: "past", label: "Passés" },
      ],
    },
    {
      key: "todo",
      label: "À traiter",
      options: [
        { value: "missing-en", label: "Traduction EN manquante" },
        { value: "missing-alt", label: "Image sans texte alternatif" },
        { value: "missing-gps", label: "Coordonnées GPS manquantes" },
      ],
    },
    {
      key: "sort",
      label: "Tri",
      options: [
        { value: "date-asc", label: "Date (plus proche d'abord)" },
        { value: "date-desc", label: "Date (plus lointaine d'abord)" },
        { value: "title", label: "Titre (A → Z)" },
      ],
    },
  ]

  const currentFilterValues = Object.fromEntries(
    filterConfigs.map(({ key }) => [key, String(params[key as keyof EventListParams] ?? "")])
  )

  const handleUnpublish = async (id: string) => {
    setIsUnpublishing(id)
    const result = await unpublishEvents([id])
    setIsUnpublishing(null)

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

  const runBulk = async (name: string, action: (ids: string[]) => Promise<EventActionResult>) => {
    setBulkAction(name)
    const result = await action(Array.from(selectedIds))
    setBulkAction(null)

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
          <p className="mt-1 text-sm text-slate-400">
            {total} résultat{total !== 1 ? "s" : ""}
          </p>
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
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Rechercher par titre, ville ou lieu..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value === "" && search) {
                router.push(listUrl({ search: undefined }))
              }
            }}
            className="border-white/10 bg-white/5 pr-10 pl-10 text-white placeholder:text-slate-500"
            aria-label="Rechercher des événements"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("")
                router.push(listUrl({ search: undefined }))
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-200"
              aria-label="Effacer la recherche"
            >
              ×
            </button>
          )}
        </div>
      </form>

      <AdminFilters
        filters={filterConfigs}
        baseUrl={BASE_URL}
        currentValues={currentFilterValues}
      />

      {items.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400">
            {search || Object.keys(params).some((key) => key !== "page")
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
                  <th className="px-4 py-3 text-left font-medium text-slate-300">Titre</th>
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
                  <th className="px-4 py-3 text-center font-medium text-slate-300">Statut</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-300">Actions</th>
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
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-400"
                            aria-label="À la une"
                          >
                            <Star className="size-3 fill-amber-400" aria-hidden="true" />À la une
                          </span>
                        )}
                        {event.tourinsoftId && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs font-medium text-violet-300"
                            title={
                              event.tourinsoftUpdatedAt
                                ? `Fiche Tourinsoft mise à jour le ${formatDate(event.tourinsoftUpdatedAt)}`
                                : undefined
                            }
                          >
                            <RefreshCw className="size-3" aria-hidden="true" />
                            Tourinsoft
                          </span>
                        )}
                        {event.accessible && (
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400"
                            aria-label="Accessible PMR"
                          >
                            <Accessibility className="size-3" aria-hidden="true" />
                            PMR
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">{event.city}</td>
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
                        <span
                          className="inline-flex items-center gap-1 text-emerald-400"
                          aria-label="Publié"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span className="hidden md:inline">Publié</span>
                        </span>
                      ) : event.unpublishedAt ? (
                        <span
                          className="inline-flex items-center gap-1 text-orange-400"
                          aria-label="Dépublié"
                        >
                          <EyeOff className="h-3.5 w-3.5" />
                          <span className="hidden md:inline">Dépublié</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-slate-500"
                          aria-label="Brouillon"
                        >
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
                        {event.published && (
                          <AlertDialog>
                            <AlertDialogTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  className="text-orange-400 hover:text-orange-300"
                                  aria-label={`Dépublier ${event.titleFr}`}
                                />
                              }
                            >
                              <EyeOff className="h-3.5 w-3.5" />
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Dépublier l&apos;événement</AlertDialogTitle>
                                <AlertDialogDescription>
                                  &quot;{event.titleFr}&quot; ne sera plus visible sur le site. Il
                                  reste dans l&apos;administration et peut être republié.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleUnpublish(event.id)}
                                  disabled={isUnpublishing === event.id}
                                >
                                  {isUnpublishing === event.id ? "Dépublication…" : "Dépublier"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
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
            baseUrl={BASE_URL}
            searchParams={Object.fromEntries(
              Object.entries(params).map(([key, value]) => [key, String(value)])
            )}
          />
        </>
      )}

      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 flex w-[calc(100%-2rem)] max-w-max -translate-x-1/2 flex-wrap items-center justify-center gap-3 rounded-xl border border-white/10 bg-slate-900/95 px-4 py-3 shadow-2xl backdrop-blur-xl">
          <span className="text-sm font-medium text-white">
            {selectedIds.size} sélectionné{selectedIds.size > 1 ? "s" : ""}
          </span>
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedIds(new Set())}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Annuler
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => runBulk("publish", publishEvents)}
              disabled={bulkAction !== null}
              className="bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
            >
              <Eye className="size-3.5" aria-hidden="true" />
              {bulkAction === "publish" ? "Publication…" : "Publier"}
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => runBulk("feature", (ids) => setEventsFeatured(ids, true))}
              disabled={bulkAction !== null}
              className="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
            >
              <Star className="size-3.5" aria-hidden="true" />
              Mettre à la une
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => runBulk("unfeature", (ids) => setEventsFeatured(ids, false))}
              disabled={bulkAction !== null}
              className="bg-white/10 text-white hover:bg-white/20"
            >
              <StarOff className="size-3.5" aria-hidden="true" />
              Retirer de la une
            </Button>
            <AlertDialog>
              <AlertDialogTrigger
                className="inline-flex h-7 items-center gap-1.5 rounded-md bg-orange-500/20 px-2.5 text-sm font-medium text-orange-300 hover:bg-orange-500/30 disabled:opacity-50"
                disabled={bulkAction !== null}
              >
                <EyeOff className="size-3.5" aria-hidden="true" />
                Dépublier
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Dépublier les événements</AlertDialogTitle>
                  <AlertDialogDescription>
                    Les événements publiés de la sélection ne seront plus visibles sur le site. Ils
                    restent dans l&apos;administration et peuvent être republiés.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => runBulk("unpublish", unpublishEvents)}
                    disabled={bulkAction !== null}
                  >
                    {bulkAction === "unpublish" ? "Dépublication…" : "Dépublier"}
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
