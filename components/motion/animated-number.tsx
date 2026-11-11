"use client"

import { useEffect, useState } from "react"
import { tweenNumber } from "@/lib/motion/tween"

type AnimatedNumberProps = {
  value: number
  from?: number
  durationMs?: number
  className?: string
  testId?: string
}

/**
 * Rolls from `from` to `value` once on load. Screen readers get the final value only;
 * without JavaScript or under reduced motion the final value shows at once.
 */
const AnimatedNumber = ({
  value,
  from = 0,
  durationMs = 1400,
  className,
  testId,
}: AnimatedNumberProps) => {
  const [shown, setShown] = useState(value)

  useEffect(() => {
    if (from === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = (now - start) / durationMs
      setShown(tweenNumber(from, value, progress))
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [from, value, durationMs])

  return (
    <span className={className} data-testid={testId} data-value={value}>
      <span aria-hidden="true" className="tabular-nums">
        {shown}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  )
}

export { AnimatedNumber }
