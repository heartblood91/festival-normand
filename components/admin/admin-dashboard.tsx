"use client"

import { useRouter } from "next/navigation"
import { LogOut, Settings, FileText, Calendar, Newspaper, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authClient } from "@/lib/auth-client"

type AdminDashboardProps = {
  user: {
    id: string
    name: string
    email: string
  }
}

const adminLinks = [
  { title: "Événements", description: "Gérer les événements du festival", icon: Calendar, href: "/admin/events" },
  { title: "Actualités", description: "Gérer les articles d'actualité", icon: Newspaper, href: "/admin/news" },
  { title: "Partenaires", description: "Gérer les partenaires", icon: Users, href: "/admin/partners" },
  { title: "Pages", description: "Modifier le contenu des pages", icon: FileText, href: "/admin/pages" },
]

export const AdminDashboard = ({ user }: AdminDashboardProps) => {
  const router = useRouter()

  const handleLogout = async () => {
    await authClient.signOut()
    router.push("/admin/login")
  }

  return (
    <div className="mx-auto w-full max-w-5xl p-4 md:p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold text-amber-500 md:text-3xl">
            Administration
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Connecté en tant que {user.name || user.email}
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="text-slate-400 hover:text-white"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {adminLinks.map((link) => (
          <Card
            key={link.href}
            className="cursor-pointer border-white/10 bg-white/5 backdrop-blur-xl transition-colors hover:border-amber-500/30 hover:bg-white/10"
            onClick={() => router.push(link.href)}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                router.push(link.href)
              }
            }}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <link.icon className="h-8 w-8 text-amber-500" />
              <div>
                <CardTitle className="text-white">{link.title}</CardTitle>
                <CardDescription className="text-slate-400">
                  {link.description}
                </CardDescription>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
