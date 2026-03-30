export const IMAGE_PRESETS = {
  cover: { width: 1200, height: 630, quality: 80 },
  thumbnail: { width: 400, height: 300, quality: 75 },
  logo: { width: 200, height: 200, quality: 85 },
  content: { width: 800, height: 600, quality: 80 },
} as const

export type ImagePreset = keyof typeof IMAGE_PRESETS

export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
