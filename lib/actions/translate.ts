"use server"

export const translateContent = async (
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> => {
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
      messages: [
        {
          role: "user",
          content: `Translate the following ${fromLang === "fr" ? "French" : "English"} text to ${toLang === "en" ? "English" : "French"}. Keep the same formatting (markdown if present). Only return the translation, nothing else.\n\n${text}`,
        },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) throw new Error(`Translation API error: ${response.status}`)

  const data = await response.json()
  return data.choices[0].message.content.trim()
}
