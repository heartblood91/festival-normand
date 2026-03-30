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

type PublishWizardProps = {
  title: string
  content: string
  locale: string
  contentType: "event" | "news" | "page"
  onComplete: (translatedFields?: Record<string, string>) => void
  onCancel: () => void
}

type Step = "seo" | "a11y" | "spelling" | "translation" | "confirmation"

const STEPS: Step[] = ["seo", "a11y", "spelling", "translation", "confirmation"]

const stepLabels: Record<Step, string> = {
  seo: "SEO Check",
  a11y: "Accessibility",
  spelling: "Spelling",
  translation: "Translation",
  confirmation: "Confirmation",
}

export const PublishWizard = ({
  title,
  content,
  locale,
  contentType,
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

  useEffect(() => {
    const runAnalysis = async () => {
      setIsLoading(true)
      try {
        setSourceFields({ title, description: content })

        const [seoResults, a11yResults, spellingResults, translationResults] =
          await Promise.all([
            checkSEO(title, content, locale),
            checkAccessibility(content),
            checkSpelling(content, locale),
            translateMultipleFields(
              { title, description: content },
              locale,
              locale === "fr" ? "en" : "fr"
            ),
          ])

        setSeoSuggestions(seoResults)
        setA11ySuggestions(a11yResults)
        setSpellingCorrections(spellingResults)
        setTranslatedFields(translationResults)
      } catch (error) {
        toast.error("Failed to analyze content")
        console.error(error)
      } finally {
        setIsLoading(false)
      }
    }

    runAnalysis()
  }, [title, content, locale])

  const handleRegenerateSEO = async () => {
    setIsLoading(true)
    try {
      const results = await checkSEO(title, content, locale)
      setSeoSuggestions(results)
      setSeoDismissed(new Set())
    } catch (error) {
      toast.error("Failed to regenerate SEO analysis")
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
    } catch (error) {
      toast.error("Failed to regenerate accessibility check")
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
    } catch (error) {
      toast.error("Failed to regenerate spelling check")
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
    } catch (error) {
      toast.error("Failed to regenerate translation")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const filteredTranslations: Record<string, string> = {}
      Object.entries(translatedFields).forEach(([key, value]) => {
        if (value?.trim()) {
          filteredTranslations[key] = value
        }
      })

      onComplete(filteredTranslations)
      toast.success("Published successfully!")
    } catch (error) {
      toast.error("Failed to publish")
      console.error(error)
    } finally {
      setIsPublishing(false)
    }
  }

  const canGoNext =
    currentStep !== "confirmation" &&
    !isLoading

  const currentStepIndex = STEPS.indexOf(currentStep)
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === STEPS.length - 1

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-2xl border-white/10 bg-slate-950 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Publish Content — {stepLabels[currentStep]}
          </DialogTitle>
          <div className="mt-4 flex gap-2">
            {STEPS.map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                disabled={isLoading || isPublishing}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  currentStep === step
                    ? "bg-amber-500 text-white"
                    : "bg-white/10 text-slate-400 hover:bg-white/20 disabled:opacity-50"
                }`}
              >
                {stepLabels[step]}
              </button>
            ))}
          </div>
        </DialogHeader>

        <div className="min-h-[400px] py-6">
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
              spellingCorrections={spellingCorrections.length - spellingAccepted.size}
              translationApplied={Object.keys(translatedFields).length > 0}
            />
          )}
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-6">
          <div className="text-xs text-slate-400">
            Step {currentStepIndex + 1} of {STEPS.length}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isLoading || isPublishing}
            >
              Cancel
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
              Previous
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
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {isLastStep && (
              <Button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || isLoading}
                className="bg-green-600 hover:bg-green-700 gap-1.5"
              >
                {isPublishing && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish Now
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
