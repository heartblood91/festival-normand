import sharp from "sharp"
import { put } from "@vercel/blob"
import { IMAGE_PRESETS, ImagePreset, MAX_FILE_SIZE, ALLOWED_TYPES } from "@/lib/image-config"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"

const generateFilename = (originalName: string, preset: ImagePreset): string => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  return `${preset}-${timestamp}-${random}.webp`
}

const validateFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Invalid file type. Allowed: ${ALLOWED_TYPES.join(", ")}`
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Max: ${MAX_FILE_SIZE / 1024 / 1024}MB`
  }
  return null
}

const compressImage = async (buffer: Buffer, preset: ImagePreset): Promise<Buffer> => {
  const config = IMAGE_PRESETS[preset]
  return sharp(buffer)
    .resize(config.width, config.height, {
      fit: "cover",
      position: "center",
    })
    .webp({ quality: config.quality })
    .toBuffer()
}

export const uploadImage = async (file: File, preset: ImagePreset = "content"): Promise<string> => {
  const validationError = validateFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const buffer = await file.arrayBuffer()
  const compressedBuffer = await compressImage(Buffer.from(buffer), preset)
  const filename = generateFilename(file.name, preset)

  if (process.env.NODE_ENV === "development") {
    const uploadsDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })
    const filePath = join(uploadsDir, filename)
    await writeFile(filePath, compressedBuffer)
    return `/uploads/${filename}`
  }

  const blob = await put(filename, compressedBuffer, {
    access: "public",
    contentType: "image/webp",
  })
  return blob.url
}
