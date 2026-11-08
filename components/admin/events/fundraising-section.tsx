"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { ExternalLink, HandHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  attachFundraisingSuggestion,
  dismissFundraisingSuggestion,
  type FundraisingSuggestionItem,
} from "@/lib/actions/fundraising"

export type FundraisingValues = { url: string; title: string; image: string }

type FundraisingSectionProps = {
  value: FundraisingValues
  onChange: (value: FundraisingValues) => void
  /** Nearby collects found by scripts/match-collectes.ts, waiting for an editor. */
  suggestions?: FundraisingSuggestionItem[]
  errors: Record<string, string[]>
}

const FIELDS = [
  {
    key: "url",
    name: "fundraisingUrl",
    label: "Lien de la collecte",
    type: "url",
    placeholder: "https://www.fondation-patrimoine.org/les-projets/…",
  },
  { key: "title", name: "fundraisingTitle", label: "Titre affiché", type: "text", placeholder: "" },
  {
    key: "image",
    name: "fundraisingImage",
    label: "Image (URL, facultative)",
    type: "url",
    placeholder: "https://strapi-upload.cdn.fondation-patrimoine.org/…",
  },
] as const

const describeSuggestion = (suggestion: FundraisingSuggestionItem) => {
  const where =
    suggestion.reason === "commune"
      ? `même commune (${suggestion.city})`
      : `${suggestion.city}, à ${suggestion.distanceKm?.toFixed(1).replace(".", ",")} km`
  return suggestion.collectedPercent !== null
    ? `${where} · ${suggestion.collectedPercent} % collectés`
    : where
}

export const FundraisingSection = ({
  value,
  onChange,
  suggestions = [],
  errors,
}: FundraisingSectionProps) => {
  const [items, setItems] = useState(suggestions)
  const [isPending, startTransition] = useTransition()

  const attach = (id: string) =>
    startTransition(async () => {
      const result = await attachFundraisingSuggestion(id)
      if (!result.success || !result.fundraising) {
        toast.error(result.message)
        return
      }
      const { url, title, image } = result.fundraising
      onChange({ url, title, image: image ?? "" })
      setItems((list) =>
        list.map((item) => (item.id === id ? { ...item, status: "ACCEPTED" } : item))
      )
      toast.success(result.message)
    })

  const dismiss = (id: string) =>
    startTransition(async () => {
      const result = await dismissFundraisingSuggestion(id)
      if (!result.success) {
        toast.error(result.message)
        return
      }
      setItems((list) => list.filter((item) => item.id !== id))
      toast.success(result.message)
    })

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <HandHeart className="size-5 text-amber-500" aria-hidden="true" />
          Collecte Fondation du patrimoine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Affiche un appel au don sur la fiche et un badge « Collecte » sur la carte de
          l&apos;événement.
        </p>
        {FIELDS.map((field) => (
          <div key={field.name}>
            <Label htmlFor={field.name} className="text-muted-foreground">
              {field.label}
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              value={value[field.key]}
              onChange={(e) => onChange({ ...value, [field.key]: e.target.value })}
              placeholder={field.placeholder || undefined}
              aria-invalid={!!errors[field.name]}
              aria-describedby={errors[field.name] ? `${field.name}-error` : undefined}
              className="placeholder:text-muted-foreground mt-1 border-white/10 bg-white/5 text-white"
            />
            {errors[field.name] && (
              <p id={`${field.name}-error`} className="mt-1 text-sm text-red-400">
                {errors[field.name][0]}
              </p>
            )}
          </div>
        ))}

        {items.length > 0 && (
          <section aria-labelledby="fundraising-suggestions-title" className="space-y-3 pt-2">
            <h3 id="fundraising-suggestions-title" className="font-medium text-white">
              Collectes proches à valider
            </h3>
            <ul className="space-y-2">
              {items.map((item) => {
                const attached = item.status === "ACCEPTED" && item.url === value.url
                return (
                  <li
                    key={item.id}
                    className="flex flex-col gap-3 rounded-lg border border-white/10 p-3 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium break-words text-white underline-offset-4 hover:underline"
                      >
                        {item.title}
                        <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                        <span className="sr-only">(nouvel onglet)</span>
                      </a>
                      <p className="text-muted-foreground text-sm">{describeSuggestion(item)}</p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {attached ? (
                        <span className="inline-flex min-h-11 items-center text-sm text-amber-500">
                          Associée
                        </span>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            disabled={isPending}
                            onClick={() => attach(item.id)}
                            aria-label={`Associer la collecte « ${item.title} »`}
                            className="min-h-11 bg-amber-500 text-slate-950 hover:bg-amber-400"
                          >
                            Associer
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={isPending}
                            onClick={() => dismiss(item.id)}
                            aria-label={`Ignorer la collecte « ${item.title} »`}
                            className="min-h-11"
                          >
                            Ignorer
                          </Button>
                        </>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  )
}
