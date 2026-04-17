"use client"

import Link from "next/link"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AdminPageListItem } from "@/lib/actions/pages"

const SYSTEM_SLUGS = ["festival", "inscription", "mentions-legales", "accessibilite"]

type AdminPagesPageProps = {
  pages: AdminPageListItem[]
}

export const AdminPagesPage = ({ pages }: AdminPagesPageProps) => {
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
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-bold text-amber-500">Pages</h1>
        <p className="text-sm text-slate-400">
          {pages.length} page{pages.length !== 1 ? "s" : ""}
        </p>
        <p className="text-sm text-slate-500">
          Les pages du site sont gérées par l'équipe technique. Vous pouvez modifier leur contenu.
        </p>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-12 text-center">
          <p className="text-slate-400">Aucune page pour le moment.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-4 py-3 text-left font-medium text-slate-300">Titre</th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-300 md:table-cell">
                  Slug
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-slate-300 md:table-cell">
                  Dernière modification
                </th>
                <th className="px-4 py-3 text-right font-medium text-slate-300">Actions</th>
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
                      <span className="font-medium text-white">{page.titleFr}</span>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">/{page.slug}</td>
                    <td className="hidden px-4 py-3 text-slate-400 md:table-cell">
                      {formatDate(page.updatedAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/pages/${page.id}/edit`}>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Modifier ${page.titleFr}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
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
