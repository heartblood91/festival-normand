"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {
  checkSEO,
  checkAccessibility,
  checkSpelling,
  translateMultipleFields,
  type SEOSuggestion,
  type A11ySuggestion,
  type SpellingCorrection,
} from "@/lib/actions/ai-publish"
import { SEOCheckStep } from "./seo-check-step"
import { A11yCheckStep } from "./a11y-check-step"
import { SpellingCheckStep } from "./spelling-check-step"
import { TranslationStep } from "./translation-step"
import { ConfirmationStep } from "./confirmation-step"
import { useAiAvailability } from "@/components/admin/shared/use-ai-availability"

export type PublishWizardResult = {
  translations: Record<string, string>
  corrections: SpellingCorrection[]
}

type PublishWizardProps = {
  title: string
  content: string
  locale: string
  contentType: "event" | "news" | "page"
  /** Source fields whose translation is still empty; existing ones are kept. */
  translationSource: Record<string, string>
  /** Saves the content; resolves to false when the server refused it. */
  onComplete: (result: PublishWizardResult) => Promise<boolean>
  onCancel: () => void
}

type Step = "seo" | "a11y" | "spelling" | "translation" | "confirmation"

const STEPS: Step[] = ["seo", "a11y", "spelling", "translation", "confirmation"]

const stepLabels: Record<Step, string> = {
  seo: "SEO",
  a11y: "Accessibilité",
  spelling: "Orthographe",
  translation: "Traduction",
  confirmation: "Confirmation",
}

export const PublishWizard = ({
  title,
  content,
  locale,
  contentType,
  translationSource,
  onComplete,
  onCancel,
}: PublishWizardProps) => {
  const [currentStep, setCurrentStep] = useState<Step>("seo")
  const [isLoading, setIsLoading] = useState(true)

  const [seoSuggestions, setSeoSuggestions] = useState<SEOSuggestion[]>([])
  const [seoDismissed, setSeoDismissed] = useState<Set<string>>(new Set())

  const [a11ySuggestions, setA11ySuggestions] = useState<A11ySuggestion[]>([])
  const [a11yDismissed, setA11yDismissed] = useState<Set<string>>(new Set())

  const [spellingCorrections, setSpellingCorrections] = useState<SpellingCorrection[]>([])
  const [spellingAccepted, setSpellingAccepted] = useState<Set<number>>(new Set())

  const [translatedFields, setTranslatedFields] = useState<Record<string, string>>({})
  const [sourceFields, setSourceFields] = useState<Record<string, string>>({})

  const [isPublishing, setIsPublishing] = useState(false)
  const aiAvailable = useAiAvailability()

  useEffect(() => {
    const runAnalysis = async () => {
      setIsLoading(true)
      try {
        setSourceFields(translationSource)

        const [seoResults, a11yResults, spellingResults, translationResults] = await Promise.all([
          checkSEO(title, content, locale),
          checkAccessibility(content),
          checkSpelling(content, locale),
          Object.keys(translationSource).length > 0
            ? translateMultipleFields(translationSource, locale, locale === "fr" ? "en" : "fr")
            : Promise.resolve({}),
        ])

        setSeoSuggestions(seoResults)
        setA11ySuggestions(a11yResults)
        setSpellingCorrections(spellingResults)
        setTranslatedFields(translationResults)
      } catch {
        toast.error("L'analyse du contenu a échoué.")
      } finally {
        setIsLoading(false)
      }
    }

    runAnalysis()
    // The analysis runs once, on the content the editor asked to publish.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRegenerateSEO = async () => {
    setIsLoading(true)
    try {
      const results = await checkSEO(title, content, locale)
      setSeoSuggestions(results)
      setSeoDismissed(new Set())
    } catch {
      toast.error("La nouvelle analyse SEO a échoué.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateA11y = async () => {
    setIsLoading(true)
    try {
      const results = await checkAccessibility(content)
      setA11ySuggestions(results)
      setA11yDismissed(new Set())
    } catch {
      toast.error("La nouvelle vérification d'accessibilité a échoué.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateSpelling = async () => {
    setIsLoading(true)
    try {
      const results = await checkSpelling(content, locale)
      setSpellingCorrections(results)
      setSpellingAccepted(new Set())
    } catch {
      toast.error("La nouvelle vérification orthographique a échoué.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerateTranslation = async () => {
    setIsLoading(true)
    try {
      const results = await translateMultipleFields(
        sourceFields,
        locale,
        locale === "fr" ? "en" : "fr"
      )
      setTranslatedFields(results)
    } catch {
      toast.error("La nouvelle traduction a échoué.")
    } finally {
      setIsLoading(false)
    }
  }

  // The form saves and reports the server result; the wizard only closes on success.
  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      await onComplete({
        translations: Object.fromEntries(
          Object.entries(translatedFields).filter(([, value]) => value?.trim())
        ),
        corrections: spellingCorrections.filter((_, index) => spellingAccepted.has(index)),
      })
    } finally {
      setIsPublishing(false)
    }
  }

  const canGoNext = currentStep !== "confirmation" && !isLoading

  const currentStepIndex = STEPS.indexOf(currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEPS.length - 1

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="bg-background max-h-[90dvh] max-w-2xl overflow-y-auto border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Publier — {stepLabels[currentStep]}
          </DialogTitle>
          <div className="mt-4 flex flex-wrap gap-2">
            {STEPS.map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                disabled={isLoading || isPublishing}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                  currentStep === step
                    ? "bg-amber-500 text-slate-950"
                    : "text-muted-foreground bg-white/10 hover:bg-white/20 disabled:opacity-50"
                }`}
              >
                {stepLabels[step]}
              </button>
            ))}
          </div>
        </DialogHeader>

        {aiAvailable === false && (
          <p
            role="status"
            className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200"
          >
            Vérifications IA indisponibles (clé OpenRouter non configurée) : aucune suggestion ni
            traduction ne sera proposée. Vous pouvez tout de même publier.
          </p>
        )}

        <div className="py-6">
          {currentStep === "seo" && (
            <SEOCheckStep
              suggestions={seoSuggestions}
              isLoading={isLoading}
              onRegenerate={handleRegenerateSEO}
              dismissed={seoDismissed}
              onDismiss={(i) => {
                const newDismissed = new Set(seoDismissed)
                newDismissed.add(`seo-${i}`)
                setSeoDismissed(newDismissed)
              }}
            />
          )}

          {currentStep === "a11y" && (
            <A11yCheckStep
              suggestions={a11ySuggestions}
              isLoading={isLoading}
              onRegenerate={handleRegenerateA11y}
              dismissed={a11yDismissed}
              onDismiss={(i) => {
                const newDismissed = new Set(a11yDismissed)
                newDismissed.add(`a11y-${i}`)
                setA11yDismissed(newDismissed)
              }}
            />
          )}

          {currentStep === "spelling" && (
            <SpellingCheckStep
              corrections={spellingCorrections}
              isLoading={isLoading}
              onRegenerate={handleRegenerateSpelling}
              accepted={spellingAccepted}
              onToggleAccept={(i) => {
                const newAccepted = new Set(spellingAccepted)
                if (newAccepted.has(i)) {
                  newAccepted.delete(i)
                } else {
                  newAccepted.add(i)
                }
                setSpellingAccepted(newAccepted)
              }}
            />
          )}

          {currentStep === "translation" && (
            <TranslationStep
              sourceLocale={locale}
              targetLocale={locale === "fr" ? "en" : "fr"}
              sourceFields={sourceFields}
              translatedFields={translatedFields}
              isLoading={isLoading}
              onRegenerate={handleRegenerateTranslation}
              onEdit={(fieldName, value) => {
                setTranslatedFields({
                  ...translatedFields,
                  [fieldName]: value,
                })
              }}
            />
          )}

          {currentStep === "confirmation" && (
            <ConfirmationStep
              contentType={contentType}
              title={title}
              locale={locale}
              seoIssues={seoSuggestions.length - seoDismissed.size}
              a11yIssues={a11ySuggestions.length - a11yDismissed.size}
              aiChecked={aiAvailable !== false}
              spellingAccepted={spellingAccepted.size}
              spellingRemaining={spellingCorrections.length - spellingAccepted.size}
              translationApplied={Object.keys(translatedFields).length > 0}
            />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6">
          <div className="text-muted-foreground text-xs">
            Étape {currentStepIndex + 1} sur {STEPS.length}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading || isPublishing}
            >
              Annuler
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                const prevIndex = currentStepIndex - 1
                if (prevIndex >= 0) {
                  setCurrentStep(STEPS[prevIndex])
                }
              }}
              disabled={isFirstStep || isLoading || isPublishing}
              className="gap-1.5"
            >
              <ChevronLeft className="h-4 w-4" />
              Précédent
            </Button>

            {!isLastStep && (
              <Button
                type="button"
                onClick={() => {
                  const nextIndex = currentStepIndex + 1
                  if (nextIndex < STEPS.length) {
                    setCurrentStep(STEPS[nextIndex])
                  }
                }}
                disabled={!canGoNext || isLoading || isPublishing}
                className="gap-1.5 bg-amber-600 hover:bg-amber-700"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {isLastStep && (
              <Button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || isLoading}
                className="gap-1.5 bg-green-600 hover:bg-green-700"
              >
                {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
                Publier maintenant
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
