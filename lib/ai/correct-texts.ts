import { chatCompletion, extractJson } from "@/lib/ai/openrouter"

export type ImportedTexts = { title: string; description: string }

const PROMPT = `Tu relis des fiches d'événements culturels normands importées d'une base touristique.
Corrige uniquement la forme du titre et de la description :
- fautes d'orthographe, de grammaire, d'accords et de typographie française (espaces insécables avant : ; ! ?, guillemets « », apostrophes) ;
- titres ou phrases écrits entièrement en MAJUSCULES : remets une casse normale, en gardant les majuscules des noms propres ;
- espaces en trop, sauts de ligne parasites, entités HTML visibles (&amp;, &nbsp;…).
N'ajoute, ne retire et ne reformule aucune information : dates, horaires, prix, lieux, noms et liens restent identiques.
Garde la mise en forme (paragraphes, listes, markdown). Si le texte est déjà correct, renvoie-le tel quel.
Réponds uniquement en JSON : {"title": "...", "description": "..."}`

// A correction that drops or adds this much text is a rewrite, not a proofread.
const MIN_LENGTH_RATIO = 0.8
const MAX_LENGTH_RATIO = 1.25

const keepsLength = (before: string, after: string) => {
  if (!before) return !after
  const ratio = after.length / before.length
  return ratio >= MIN_LENGTH_RATIO && ratio <= MAX_LENGTH_RATIO
}

/**
 * Proofreads imported French texts. Throws when the model cannot be reached,
 * so callers can retry later; returns the original texts when the model's
 * answer is unusable or changes the content too much.
 */
export const correctImportedTexts = async (texts: ImportedTexts): Promise<ImportedTexts> => {
  const answer = await chatCompletion(
    [
      { role: "system", content: PROMPT },
      { role: "user", content: JSON.stringify(texts) },
    ],
    { temperature: 0 }
  )

  let corrected: Partial<ImportedTexts>
  try {
    corrected = extractJson<Partial<ImportedTexts>>(answer)
  } catch {
    return texts
  }

  const title = typeof corrected.title === "string" ? corrected.title.trim() : ""
  const description = typeof corrected.description === "string" ? corrected.description.trim() : ""
  return {
    title: title && keepsLength(texts.title, title) ? title : texts.title,
    description: keepsLength(texts.description, description) ? description : texts.description,
  }
}
