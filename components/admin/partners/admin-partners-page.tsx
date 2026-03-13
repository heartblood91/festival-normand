"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Plus,
  ArrowLeft,
  Pencil,
  Trash2,
  GripVertical,
  ArrowUp,
  ArrowDown,
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
import {
  deletePartner,
  reorderPartners,
  type AdminPartnerListItem,
} from "@/lib/actions/partners"

type AdminPartnersPageProps = {
  partners: AdminPartnerListItem[]
}

export const AdminPartnersPage = ({ partners: initialPartners }: AdminPartnersPageProps) => {
  const router = useRouter()
  const [partners, setPartners] = useState(initialPartners)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)

  const handleDelete = async (id: string) => {
    setIsDeleting(id)
    const result = await deletePartner(id)
    setIsDeleting(null)

    if (result.success) {
      toast.success(result.message)
      setPartners(partners.filter((p) => p.id !== id))
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const movePartner = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= partners.length) return

    const reordered = [...partners]
    const [moved] = reordered.splice(index, 1)
    reordered.splice(newIndex, 0, moved)

    setPartners(reordered)
    setIsReordering(true)

    const result = await reorderPartners(reordered.map((p) => p.id))
    setIsReordering(false)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
      setPartners(initialPartners)
    }
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
            Partenaires
          </h1>
          <span className="text-sm text-slate-400">
            ({partners.length} partenaire{partners.length !== 1 ? "s" : ""})
          </span>
        </div>
        <Link href="/admin/partners/new">
          <Button className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Nouveau partenaire
          </Button>
        </Link>
      </div>

      {partners.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400">
            Aucun partenaire pour le moment.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {partners.map((partner, index) => (
            <div
              key={partner.id}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <div className="flex flex-col gap-0.5" aria-label={`Réordonner ${partner.name}`}>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => movePartner(index, "up")}
                  disabled={index === 0 || isReordering}
                  aria-label={`Monter ${partner.name}`}
                  className="h-6 w-6 text-slate-500 hover:text-white"
                >
                  <ArrowUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => movePartner(index, "down")}
                  disabled={index === partners.length - 1 || isReordering}
                  aria-label={`Descendre ${partner.name}`}
                  className="h-6 w-6 text-slate-500 hover:text-white"
                >
                  <ArrowDown className="h-3 w-3" />
                </Button>
              </div>

              <GripVertical className="h-4 w-4 text-slate-600" aria-hidden="true" />

              {partner.logo && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={partner.logo}
                    alt={`Logo ${partner.name}`}
                    className="h-full w-full object-contain"
                  />
                </div>
              )}

              <div className="flex-1">
                <p className="font-medium text-white">{partner.name}</p>
                {partner.website && (
                  <p className="text-xs text-slate-500 truncate">{partner.website}</p>
                )}
              </div>

              <span className="hidden text-xs text-slate-600 md:inline">
                #{index + 1}
              </span>

              <div className="flex items-center gap-1">
                <Link href={`/admin/partners/${partner.id}/edit`}>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Modifier ${partner.name}`}
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
                        aria-label={`Supprimer ${partner.name}`}
                      />
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Supprimer le partenaire</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir supprimer &quot;{partner.name}&quot; ?
                        Cette action est irréversible.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Annuler</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => handleDelete(partner.id)}
                        disabled={isDeleting === partner.id}
                      >
                        {isDeleting === partner.id ? "Suppression..." : "Supprimer"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
