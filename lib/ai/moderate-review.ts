import { chatCompletion, extractJson } from "@/lib/ai/openrouter"

// Cédric's choice: an OpenRouter router model, kept apart from OPENROUTER_MODEL
// so the proofreading model can change without touching moderation.
export const MODERATION_MODEL = "typesafe/jev-router"

export type ModerationVerdict = { verdict: "approve" | "reject"; reason: string }

type ReviewToModerate = {
  eventTitle: string
  authorName: string
  rating: number
  comment: string
}

const PROMPT = `Tu modères les avis laissés par des visiteurs sur les sites d'un festival du patrimoine normand (Pierres en Lumières).
Recommande "reject" si l'avis contient : insultes, propos haineux, discriminatoires ou diffamatoires visant une personne nommée, contenu sexuel, publicité ou spam, liens ou coordonnées (téléphone, e-mail, adresse), données personnelles d'autrui, ou un texte sans rapport avec la visite ou incompréhensible.
Une critique négative mais polie est légitime : recommande "approve".
Le nom de l'auteur suit les mêmes règles (pas d'insulte ni de publicité).
Réponds uniquement en JSON : {"verdict": "approve" ou "reject", "reason": "une phrase courte en français"}`

const MAX_REASON = 300

/**
 * Asks the moderation model for advice. Throws when the model cannot be
 * reached; returns null when its answer is unusable. Either way the review
 * stays pending until an editor decides.
 */
export const moderateReview = async (
  review: ReviewToModerate
): Promise<ModerationVerdict | null> => {
  const answer = await chatCompletion(
    [
      { role: "system", content: PROMPT },
      { role: "user", content: JSON.stringify(review) },
    ],
    { temperature: 0, model: MODERATION_MODEL }
  )

  let parsed: Partial<ModerationVerdict>
  try {
    parsed = extractJson<Partial<ModerationVerdict>>(answer)
  } catch {
    return null
  }
  if (parsed.verdict !== "approve" && parsed.verdict !== "reject") return null
  const reason = typeof parsed.reason === "string" ? parsed.reason.trim().slice(0, MAX_REASON) : ""
  return { verdict: parsed.verdict, reason }
}
