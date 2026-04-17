"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react"
import { toast } from "sonner"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
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
import { deletePartner, reorderPartners, type AdminPartnerListItem } from "@/lib/actions/partners"

type AdminPartnersPageProps = {
  partners: AdminPartnerListItem[]
}

const SortablePartnerItem = ({
  partner,
  index,
  onDelete,
  isDeletingId,
}: {
  partner: AdminPartnerListItem
  index: number
  onDelete: (id: string) => void
  isDeletingId: string | null
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: partner.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors ${
        isDragging ? "opacity-50" : ""
      } hover:border-amber-500/30 hover:bg-white/10`}
    >
      <button
        {...attributes}
        {...listeners}
        className="flex shrink-0 cursor-grab items-center justify-center rounded-lg p-1 hover:bg-white/10 active:cursor-grabbing"
        aria-label={`Réordonner ${partner.nameFr}`}
      >
        <GripVertical className="h-4 w-4 text-slate-600" aria-hidden="true" />
      </button>

      {partner.logo && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={partner.logo}
            alt={`Logo ${partner.nameFr}`}
            className="h-full w-full object-contain"
          />
        </div>
      )}

      <div className="flex-1">
        <p className="font-medium text-white">{partner.nameFr}</p>
        {partner.website && <p className="truncate text-xs text-slate-500">{partner.website}</p>}
      </div>

      <span className="hidden text-xs text-slate-600 md:inline">#{index + 1}</span>

      <div className="flex items-center gap-1">
        <Link href={`/admin/partners/${partner.id}/edit`}>
          <Button variant="ghost" size="icon-sm" aria-label={`Modifier ${partner.nameFr}`}>
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
                aria-label={`Supprimer ${partner.nameFr}`}
              />
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le partenaire</AlertDialogTitle>
              <AlertDialogDescription>
                Êtes-vous sûr de vouloir supprimer &quot;{partner.nameFr}&quot; ? Cette action est
                irréversible.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                onClick={() => onDelete(partner.id)}
                disabled={isDeletingId === partner.id}
              >
                {isDeletingId === partner.id ? "Suppression..." : "Supprimer"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}

export const AdminPartnersPage = ({ partners: initialPartners }: AdminPartnersPageProps) => {
  const router = useRouter()
  const [partners, setPartners] = useState(initialPartners)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  )

  const partnerIds = useMemo(() => partners.map((p) => p.id), [partners])

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

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = partners.findIndex((p) => p.id === active.id)
      const newIndex = partners.findIndex((p) => p.id === over.id)

      const reordered = arrayMove(partners, oldIndex, newIndex)
      setPartners(reordered)

      const result = await reorderPartners(reordered.map((p) => p.id))

      if (result.success) {
        toast.success(result.message)
        router.refresh()
      } else {
        toast.error(result.message)
        setPartners(initialPartners)
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-bold text-amber-500">Partenaires</h1>
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
          <p className="text-slate-400">Aucun partenaire pour le moment.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={partnerIds} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {partners.map((partner, index) => (
                <SortablePartnerItem
                  key={partner.id}
                  partner={partner}
                  index={index}
                  onDelete={handleDelete}
                  isDeletingId={isDeleting}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}
