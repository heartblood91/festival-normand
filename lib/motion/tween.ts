/** Fast start, gentle landing; progress is clamped to [0, 1]. */
const easeOutCubic = (progress: number) => {
  const clamped = Math.min(1, Math.max(0, progress))
  return 1 - (1 - clamped) ** 3
}

/** Whole number between `from` and `to` at `progress`, eased. */
const tweenNumber = (from: number, to: number, progress: number) =>
  Math.round(from + (to - from) * easeOutCubic(progress))

/** The hero countdown ticks down from two months further away; nothing to tick once it is over. */
const countdownStart = (days: number) => (days > 0 ? days + 60 : days)

export { countdownStart, easeOutCubic, tweenNumber }
