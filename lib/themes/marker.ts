export const DEFAULT_PIN_COLOR = "#f59e0b"

type PinTheme = { order: number; color: string; markerImage: string | null }

/** Colour and marker image of an event's pin: its first theme decides. */
export const themePin = (themes: PinTheme[]) => {
  const sorted = [...themes].sort((a, b) => a.order - b.order)
  return {
    color: sorted[0]?.color ?? DEFAULT_PIN_COLOR,
    marker: sorted.find((theme) => theme.markerImage)?.markerImage ?? null,
  }
}
