"use server"

export type SEOSuggestion = {
  type: "heading" | "meta" | "keyword" | "structure"
  message: string
  severity: "error" | "warning" | "info"
}

export type A11ySuggestion = {
  type: "heading-order" | "alt-text" | "link-text" | "contrast"
  message: string
  severity: "error" | "warning"
}

export type SpellingCorrection = {
  original: string
  corrected: string
  context: string
}

const callOpenRouter = async (prompt: string): Promise<string> => {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured")

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-flash-2.0",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    }),
  })

  if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`)

  const data = await response.json()
  return data.choices[0].message.content.trim()
}

export const checkSEO = async (
  title: string,
  content: string,
  locale: string
): Promise<SEOSuggestion[]> => {
  try {
    const prompt = `Analyze this ${locale === "fr" ? "French" : "English"} content for SEO issues. Check: heading hierarchy (should not have h1, should start at h2 minimum), meta description quality (50-160 characters), keyword usage, content structure (proper sections, clear hierarchy).

Title: ${title}
Content: ${content}

Return ONLY a valid JSON array of suggestions with this exact structure. Each object MUST have: type (one of: "heading", "meta", "keyword", "structure"), message (string), severity (one of: "error", "warning", "info").

Example format:
[
  {"type": "heading", "message": "...", "severity": "error"},
  {"type": "meta", "message": "...", "severity": "warning"}
]

Return empty array [] if no issues found.`

    const response = await callOpenRouter(prompt)
    const parsed = JSON.parse(response)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const checkAccessibility = async (content: string): Promise<A11ySuggestion[]> => {
  try {
    const prompt = `Analyze this HTML/markdown content for WCAG 2.1 accessibility issues. Check:
1. Heading order (h1 should be first, then h2, h3 in sequence - no skipping levels)
2. Images have alt text descriptions
3. Links have descriptive text (avoid "click here", "read more" without context)
4. Proper list structure (ul/ol with li items)
5. Color contrast sufficient for readability

Content: ${content}

Return ONLY a valid JSON array. Each object MUST have: type (one of: "heading-order", "alt-text", "link-text", "contrast"), message (string), severity (one of: "error", "warning").

Example format:
[
  {"type": "heading-order", "message": "...", "severity": "error"},
  {"type": "alt-text", "message": "...", "severity": "warning"}
]

Return empty array [] if no issues found.`

    const response = await callOpenRouter(prompt)
    const parsed = JSON.parse(response)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const checkSpelling = async (
  content: string,
  locale: string
): Promise<SpellingCorrection[]> => {
  try {
    const prompt = `Check this ${locale === "fr" ? "French" : "English"} text for spelling and grammar errors.

Text: ${content}

Return ONLY a valid JSON array of corrections. Each object MUST have: original (the misspelled word), corrected (the correct form), context (the surrounding sentence where error appears).

Example format:
[
  {"original": "thier", "corrected": "their", "context": "...surrounding sentence..."},
  {"original": "occured", "corrected": "occurred", "context": "...surrounding sentence..."}
]

Return empty array [] if no errors found.`

    const response = await callOpenRouter(prompt)
    const parsed = JSON.parse(response)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export const translateMultipleFields = async (
  fields: Record<string, string>,
  fromLang: string,
  toLang: string
): Promise<Record<string, string>> => {
  try {
    const entries = Object.entries(fields)
      .filter(([_, v]) => v?.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n---\n")

    const prompt = `Translate these ${fromLang === "fr" ? "French" : "English"} fields to ${toLang === "en" ? "English" : "French"}. Keep markdown formatting. Return ONLY a valid JSON object with the same field names as keys.

Fields:
${entries}

Example format:
{
  "title": "...",
  "description": "...",
  "pricing": "..."
}

Return ONLY valid JSON, no other text.`

    const response = await callOpenRouter(prompt)
    const parsed = JSON.parse(response)
    return typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}
