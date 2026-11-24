"use client"

import { useEffect, useRef, useState } from "react"
import { tweenNumber } from "@/lib/motion/tween"

type AnimatedNumberProps = {
  value: number
  from?: number
  durationMs?: number
  className?: string
  testId?: string
}

/**
 * Rolls from `from` to `value` when it scrolls into view. A number already on screen at
 * load keeps its server value: rewinding it to `from` would flash the final figure first.
 * Screen readers get the final value only; without JavaScript or under reduced motion the
 * final value shows at once.
 */
const AnimatedNumber = ({
  value,
  from = 0,
  durationMs = 1400,
  className,
  testId,
}: AnimatedNumberProps) => {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(value)

  useEffect(() => {
    const node = ref.current
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const { top, bottom } = node?.getBoundingClientRect() ?? { top: 0, bottom: 0 }
    if (!node || from === value || reduced || (bottom > 0 && top < window.innerHeight)) {
      setShown(value)
      return
    }

    let frame = 0
    const run = () => {
      const start = performance.now()
      const tick = (now: number) => {
        const progress = (now - start) / durationMs
        setShown(tweenNumber(from, value, progress))
        if (progress < 1) frame = requestAnimationFrame(tick)
      }
      frame = requestAnimationFrame(tick)
    }
    // Off screen, so rewinding is invisible.
    setShown(from)
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      run()
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [from, value, durationMs])

  return (
    <span ref={ref} className={className} data-testid={testId} data-value={value}>
      <span aria-hidden="true" className="tabular-nums">
        {shown}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  )
}

export { AnimatedNumber }
