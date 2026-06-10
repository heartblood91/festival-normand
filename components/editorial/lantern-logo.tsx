type LanternLogoProps = {
  className?: string
}

// Editorial mark: a lantern — concentric rings with a warm amber flame.
const LanternLogo = ({ className }: LanternLogoProps) => (
  <svg viewBox="0 0 28 28" className={className} aria-hidden="true">
    <circle cx="14" cy="14" r="13" fill="none" stroke="var(--primary)" strokeWidth="1.2" />
    <circle cx="14" cy="14" r="8" fill="none" stroke="var(--primary)" strokeWidth="0.6" opacity="0.5" />
    <ellipse cx="14" cy="13" rx="3" ry="5" fill="var(--primary)" opacity="0.9" />
  </svg>
)

export { LanternLogo }
