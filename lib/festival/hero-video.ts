import { existsSync } from "node:fs"
import { join } from "node:path"

const LOCAL_VIDEO = "/videos/hero.mp4"

/**
 * Hero background video, or null to show the still poster only.
 * HERO_VIDEO_URL points at a hosted file; otherwise the local file is used only
 * when it was deployed (it is gitignored, so most deploys do not ship it).
 */
export const heroVideoSrc = (root: string = process.cwd()): string | null => {
  const configured = process.env.HERO_VIDEO_URL?.trim()
  if (configured) return configured
  return existsSync(join(root, "public", LOCAL_VIDEO)) ? LOCAL_VIDEO : null
}
