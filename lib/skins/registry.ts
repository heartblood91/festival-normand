/**
 * Seasonal skins of the public site. A skin is attached to a theme in
 * /admin/themes and shows only the years that theme is shown.
 *
 * To remove a skin from the code: delete its folder in components/skins/,
 * its entry here and in components/skins/index.tsx. A theme still pointing
 * to a removed skin simply renders the regular site.
 */
export const SKINS = {
  millennium: "Millénaire de Guillaume le Conquérant",
} as const

export type SkinKey = keyof typeof SKINS

export const isSkinKey = (value: unknown): value is SkinKey =>
  typeof value === "string" && Object.hasOwn(SKINS, value)
