"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type PasswordInputProps = Omit<React.ComponentProps<"input">, "type"> & {
  /** Localized label for the toggle button (a11y). Defaults to French. */
  showLabel?: string
  hideLabel?: string
}

/**
 * Password input with an external visibility toggle.
 *
 * The toggle sits OUTSIDE the input's visual border on purpose: password
 * managers (Proton Pass, 1Password, …) inject their own affordance on the
 * inner-right edge, which would hide a toggle placed inside the input.
 */
const PasswordInput = ({
  className,
  showLabel = "Afficher le mot de passe",
  hideLabel = "Masquer le mot de passe",
  ...props
}: PasswordInputProps) => {
  const [revealed, setRevealed] = React.useState(false)
  const Icon = revealed ? EyeOff : Eye

  return (
    <div className="flex items-stretch gap-2">
      <Input
        {...props}
        type={revealed ? "text" : "password"}
        className={cn("flex-1", className)}
      />
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        aria-pressed={revealed}
        aria-label={revealed ? hideLabel : showLabel}
        title={revealed ? hideLabel : showLabel}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-lg border border-white/15 bg-white/5",
          "px-2.5 text-slate-200 transition-colors",
          "hover:border-white/25 hover:bg-white/10 hover:text-white",
          "focus-visible:border-amber-400 focus-visible:ring-2 focus-visible:ring-amber-400/40 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          // Native :has() selector keeps min height aligned with the input above
          "min-h-10"
        )}
      >
        <Icon className="size-4" aria-hidden />
      </button>
    </div>
  )
}

export { PasswordInput }
