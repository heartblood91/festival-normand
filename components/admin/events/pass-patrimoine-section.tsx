"use client"

import { ExternalLink, Ticket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { suggestPassSites, type PassSiteSuggestion } from "@/lib/pass-patrimoine/sites"
import { normalizePassPatrimoineUrl } from "@/lib/pass-patrimoine/url"

type PassPatrimoineSectionProps = {
  value: string
  onChange: (value: string) => void
  /** Current place of the event, matched against the bundled partner list. */
  place: { title: string; location: string; city: string; postalCode: string }
  errors: Record<string, string[]>
}

const REASONS: Record<PassSiteSuggestion["reason"], string> = {
  both: "nom et commune",
  name: "nom du site",
  city: "même commune",
}

export const PassPatrimoineSection = ({
  value,
  onChange,
  place,
  errors,
}: PassPatrimoineSectionProps) => {
  const current = normalizePassPatrimoineUrl(value)
  const suggestions = suggestPassSites(place).filter((site) => site.url !== current)

  return (
    <Card className="border-white/10 bg-white/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Ticket className="size-5 text-amber-500" aria-hidden="true" />
          Pass Patrimoine
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">
          Si ce lieu est partenaire du Pass Patrimoine, collez sa fiche : un encart « Accessible
          avec le Pass Patrimoine » s&apos;affiche sur l&apos;événement quand le Pass est activé
          dans les réglages du site. La synchronisation Tourinsoft ne modifie jamais ce lien.
        </p>
        <div>
          <Label htmlFor="passPatrimoineUrl" className="text-muted-foreground">
            Fiche du lieu sur pass-patrimoine.fr
          </Label>
          <Input
            id="passPatrimoineUrl"
            name="passPatrimoineUrl"
            type="url"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://www.pass-patrimoine.fr/fr/lieux-et-visites/…"
            aria-invalid={!!errors.passPatrimoineUrl}
            aria-describedby={errors.passPatrimoineUrl ? "passPatrimoineUrl-error" : undefined}
            className="placeholder:text-muted-foreground mt-1 border-white/10 bg-white/5 text-white"
          />
          {errors.passPatrimoineUrl && (
            <p id="passPatrimoineUrl-error" className="mt-1 text-sm text-red-400">
              {errors.passPatrimoineUrl[0]}
            </p>
          )}
        </div>

        {suggestions.length > 0 && (
          <section aria-labelledby="pass-suggestions-title" className="space-y-3 pt-2">
            <h3 id="pass-suggestions-title" className="font-medium text-white">
              Sites partenaires qui ressemblent à ce lieu
            </h3>
            <p className="text-muted-foreground text-xs">
              Suggestions tirées de la liste des sites normands connus : vérifiez la fiche avant de
              l&apos;associer.
            </p>
            <ul className="space-y-2">
              {suggestions.map((site) => (
                <li
                  key={site.slug}
                  className="flex flex-col gap-3 rounded-lg border border-white/10 p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div className="min-w-0">
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-medium break-words text-white underline-offset-4 hover:underline"
                    >
                      {site.name}
                      <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                      <span className="sr-only">(nouvel onglet)</span>
                    </a>
                    <p className="text-muted-foreground text-sm">
                      {site.city} · {REASONS[site.reason]}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onChange(site.url)}
                    aria-label={`Associer la fiche Pass Patrimoine « ${site.name} »`}
                    className="min-h-11 shrink-0 bg-amber-500 text-slate-950 hover:bg-amber-400"
                  >
                    Associer
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </CardContent>
    </Card>
  )
}
