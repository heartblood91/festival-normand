/** French labels for the publish review: the AI returns stable English keys. */
export const SEVERITY_LABELS: Record<string, string> = {
  error: "Bloquant",
  warning: "À vérifier",
  info: "Conseil",
}

export const ISSUE_TYPE_LABELS: Record<string, string> = {
  heading: "Titres",
  meta: "Métadonnées",
  keyword: "Mots-clés",
  structure: "Structure",
  "heading-order": "Ordre des titres",
  "alt-text": "Texte alternatif",
  "link-text": "Intitulé de lien",
  contrast: "Contraste",
}

export const FIELD_LABELS: Record<string, string> = {
  title: "Titre",
  description: "Description",
  pricing: "Tarifs",
  excerpt: "Résumé",
  content: "Contenu",
}

export const pointsToCheck = (count: number, topic: string) =>
  `${count} point${count > 1 ? "s" : ""} ${topic} à vérifier.`
