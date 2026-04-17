"use client"

import { useState } from "react"
import { Languages, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { translateContent } from "@/lib/actions/translate"
import { toast } from "sonner"

type TranslateButtonProps = {
  sourceFields: Record<string, string>
  onTranslated: (translations: Record<string, string>) => void
  fromLang?: string
  toLang?: string
}

export const TranslateButton = ({
  sourceFields,
  onTranslated,
  fromLang = "fr",
  toLang = "en",
}: TranslateButtonProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleTranslate = async () => {
    setIsLoading(true)
    try {
      const entries = Object.entries(sourceFields).filter(([_, v]) => v?.trim())
      const translations: Record<string, string> = {}

      for (const [key, value] of entries) {
        const targetKey = key.replace(/Fr$/, "En")
        const translated = await translateContent(value, fromLang, toLang)
        translations[targetKey] = translated
      }

      onTranslated(translations)
      toast.success("Translation completed")
    } catch {
      toast.error("Translation failed. Check your OpenRouter API key.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleTranslate}
      disabled={isLoading}
      className="gap-1.5"
    >
      {isLoading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <Languages className="size-3.5" />
      )}
      {isLoading ? "Translating..." : "Auto-translate from FR"}
    </Button>
  )
}
