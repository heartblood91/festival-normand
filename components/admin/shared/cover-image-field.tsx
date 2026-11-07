"use client"

import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/admin/image-upload"
import { AltTextField } from "./alt-text-field"

type CoverImageFieldProps = {
  value: string
  onChange: (url: string) => void
  altFr: string
  altEn: string
  onAltChange: (alt: { fr: string; en: string }) => void
  /** Page title the AI may use to name the place in the proposal. */
  context: string
  errors: Record<string, string[]>
}

/** Cover upload with its FR/EN alt texts, required before publishing. */
export const CoverImageField = ({
  value,
  onChange,
  altFr,
  altEn,
  onAltChange,
  context,
  errors,
}: CoverImageFieldProps) => (
  <div className="space-y-4">
    <div>
      <Label className="mb-2 block text-slate-300">Image de couverture</Label>
      <ImageUpload
        value={value}
        onChange={(url) => {
          onChange(url)
          // A new image needs its own description.
          onAltChange({ fr: "", en: "" })
        }}
        preset="cover"
      />
    </div>
    {value && (
      <>
        <AltTextField
          id="coverImageAltFr"
          name="coverImageAltFr"
          label="Texte alternatif (FR) *"
          value={altFr}
          onChange={(fr) => onAltChange({ fr, en: altEn })}
          imageUrl={value}
          context={context}
          error={errors.coverImageAltFr?.[0]}
        />
        <AltTextField
          id="coverImageAltEn"
          name="coverImageAltEn"
          label="Texte alternatif (EN)"
          value={altEn}
          onChange={(en) => onAltChange({ fr: altFr, en })}
          error={errors.coverImageAltEn?.[0]}
          lang="en"
        />
      </>
    )}
  </div>
)
