"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Plus, Pencil, Trash2, Shield, Edit2 } from "lucide-react"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { deleteUser, updateUserRole, type AdminUser } from "@/lib/actions/users"
import { InviteUserDialog } from "./invite-user-dialog"

type AdminUsersPageProps = {
  users: AdminUser[]
  currentUserId: string
}

export const AdminUsersPage = ({ users, currentUserId }: AdminUsersPageProps) => {
  const router = useRouter()
  const t = useTranslations("admin")
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isUpdatingRole, setIsUpdatingRole] = useState<string | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const adminCount = users.filter((u) => u.role === "ADMIN").length
  const isUserAdmin = users.find((u) => u.id === currentUserId)?.role === "ADMIN"
  const isSoleAdmin = adminCount === 1

  const handleDelete = async (id: string) => {
    const user = users.find((u) => u.id === id)
    if (!user) return

    const isSoleAdminUser = user.role === "ADMIN" && isSoleAdmin

    if (isSoleAdminUser) {
      toast.error("Impossible de supprimer le dernier administrateur.")
      return
    }

    setIsDeleting(id)
    const formData = new FormData()
    formData.append("id", id)

    const result = await deleteUser(id)
    setIsDeleting(null)

    if (result.success) {
      toast.success(result.message)
      router.refresh()
    } else {
      toast.error(result.message)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const user = users.find((u) => u.id === userId)
    if (!user) return

    const isSoleAdminUser = user.role === "ADMIN" && isSoleAdmin && newRole === "EDITOR"

    if (isSoleAdminUser) {
      toast.error("Impossible de rétrograder le dernier administrateur.")
      return
    }

    setIsUpdatingRole(userId)
    const formData = new FormData()
    formData.append("userId", userId)
    formData.append("role", newRole)

    const result = await updateUserRole(formData)
    setIsUpdatingRole(null)

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
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-amber-500">Utilisateurs</h1>
          <p className="mt-1 text-sm text-slate-400">
            {users.length} résultat{users.length !== 1 ? "s" : ""}
          </p>
        </div>
        {isUserAdmin && (
          <Button onClick={() => setInviteOpen(true)} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Inviter un utilisateur
          </Button>
        )}
      </div>

      <InviteUserDialog open={inviteOpen} onOpenChange={setInviteOpen} />

      {users.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400">Aucun utilisateur pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-slate-300">Nom</th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-300 md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-slate-300">Rôle</th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-300 lg:table-cell">
                  Créé le
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-white/5 transition-colors hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{user.name}</span>
                      {user.id === currentUserId && (
                        <span className="text-xs text-amber-400">Vous</span>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 md:table-cell">{user.email}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.role === "ADMIN" ? (
                        <>
                          <Shield className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-amber-500">Admin</span>
                        </>
                      ) : (
                        <>
                          <Edit2 className="h-3.5 w-3.5 text-blue-400" />
                          <span className="text-blue-400">Éditeur</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 lg:table-cell">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {isUserAdmin && user.id !== currentUserId && (
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={user.role}
                          onValueChange={(newRole) => newRole && handleRoleChange(user.id, newRole)}
                          disabled={
                            isUpdatingRole === user.id || (user.role === "ADMIN" && isSoleAdmin)
                          }
                        >
                          <SelectTrigger className="w-24 border-white/10 bg-white/5 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                            <SelectItem value="EDITOR">Éditeur</SelectItem>
                          </SelectContent>
                        </Select>

                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                className="text-red-400 hover:text-red-300"
                                aria-label={`Supprimer ${user.name}`}
                                disabled={isSoleAdmin && user.role === "ADMIN"}
                              />
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l&apos;utilisateur</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer &quot;{user.name}&quot; ? Cette
                                action est irréversible.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                variant="destructive"
                                onClick={() => handleDelete(user.id)}
                                disabled={isDeleting === user.id}
                              >
                                {isDeleting === user.id ? "Suppression..." : "Supprimer"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    )}
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
