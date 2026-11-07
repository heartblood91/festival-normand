import { describe, expect, it } from "vitest"
import {
  applySpellingCorrections,
  fillMissingTranslations,
  missingTranslationSource,
  needsPublishWizard,
} from "./publish-flow"

describe("needsPublishWizard", () => {
  it("runs the wizard only when a draft is being published", () => {
    expect(needsPublishWizard({ wasPublished: false, willPublish: true })).toBe(true)
    expect(needsPublishWizard({ wasPublished: true, willPublish: true })).toBe(false)
    expect(needsPublishWizard({ wasPublished: true, willPublish: false })).toBe(false)
    expect(needsPublishWizard({ wasPublished: false, willPublish: false })).toBe(false)
  })
})

describe("fillMissingTranslations", () => {
  it("only fills empty fields and never overwrites existing translations", () => {
    expect(
      fillMissingTranslations(
        { title: "Existing title", description: "", pricing: "   " },
        { title: "AI title", description: "AI description", pricing: "Free", extra: "x" }
      )
    ).toEqual({ title: "Existing title", description: "AI description", pricing: "Free" })
  })

  it("treats empty rich text as missing", () => {
    expect(fillMissingTranslations({ description: "<p></p>" }, { description: "Text" })).toEqual({
      description: "Text",
    })
  })

  it("keeps the current value when the proposal is blank", () => {
    expect(fillMissingTranslations({ title: "" }, { title: "  " })).toEqual({ title: "" })
  })
})

describe("missingTranslationSource", () => {
  it("asks the AI only for fields with a source and no translation yet", () => {
    expect(
      missingTranslationSource({
        title: ["Titre", "Title"],
        description: ["<p>Texte</p>", "<p></p>"],
        pricing: ["<p>&nbsp;</p>", ""],
      })
    ).toEqual({ description: "<p>Texte</p>" })
  })
})

describe("applySpellingCorrections", () => {
  it("replaces whole words only", () => {
    expect(
      applySpellingCorrections("Une égglise et une églisette", [
        { original: "égglise", corrected: "église", context: "" },
        { original: "église", corrected: "X", context: "" },
      ])
    ).toBe("Une église et une églisette")
  })

  it("leaves HTML tags and attributes untouched", () => {
    expect(
      applySpellingCorrections('<p class="chateau">Le chateau <a href="/chateau">chateau</a></p>', [
        { original: "chateau", corrected: "château", context: "" },
      ])
    ).toBe('<p class="chateau">Le château <a href="/chateau">château</a></p>')
  })

  it("escapes regex characters and ignores empty corrections", () => {
    expect(
      applySpellingCorrections("Prix (env.) 5 €", [
        { original: "(env.)", corrected: "(environ)", context: "" },
        { original: "", corrected: "oops", context: "" },
      ])
    ).toBe("Prix (environ) 5 €")
  })
})
