// Internal LLM client. Not a server action: callers that are reachable over HTTP
// (server actions) must check authorization themselves before calling it.

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
const DEFAULT_MODEL = "google/gemini-3.5-flash-lite"
const REQUEST_TIMEOUT_MS = 45_000

export type ChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } }

export type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string | ChatContentPart[]
}

type ChatOptions = {
  temperature?: number
  model?: string
}

export const isAiConfigured = (): boolean => Boolean(process.env.OPENROUTER_API_KEY?.trim())

export const getAiModel = (): string => process.env.OPENROUTER_MODEL?.trim() || DEFAULT_MODEL

export const chatCompletion = async (
  messages: ChatMessage[],
  { temperature = 0.2, model = getAiModel() }: ChatOptions = {}
): Promise<string> => {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim()
  if (!apiKey) throw new Error("OPENROUTER_API_KEY not configured")

  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ model, messages, temperature }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  })

  if (!response.ok) throw new Error(`OpenRouter API error: ${response.status}`)

  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] }
  const content = data.choices?.[0]?.message?.content
  if (typeof content !== "string") throw new Error("OpenRouter returned no content")
  return content.trim()
}

// Models often wrap JSON in ```json fences or add a sentence around it.
export const extractJson = <T>(text: string): T => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  const candidate = (fenced ? fenced[1] : text).trim()
  try {
    return JSON.parse(candidate) as T
  } catch {
    const start = candidate.search(/[[{]/)
    const end = Math.max(candidate.lastIndexOf("]"), candidate.lastIndexOf("}"))
    if (start === -1 || end <= start) throw new Error("No JSON found in model response")
    return JSON.parse(candidate.slice(start, end + 1)) as T
  }
}

const LANGUAGE_NAMES: Record<string, string> = { fr: "French", en: "English" }

export const translateText = async (
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> =>
  chatCompletion(
    [
      {
        role: "user",
        content: `Translate the following ${LANGUAGE_NAMES[fromLang] ?? fromLang} text to ${LANGUAGE_NAMES[toLang] ?? toLang}. Keep the same formatting (markdown if present) and proper nouns of places. Only return the translation, nothing else.\n\n${text}`,
      },
    ],
    { temperature: 0.3 }
  )
