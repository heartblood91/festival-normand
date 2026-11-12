import sharp from "sharp"
import { put } from "@vercel/blob"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getS3, MEDIA_PREFIX, s3Bucket } from "@/lib/s3"
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
      fit: "fit" in config ? config.fit : "cover",
      position: "center",
      withoutEnlargement: "fit" in config,
    })
    .webp({ quality: config.quality })
    .toBuffer()
}

const persistImage = async (buffer: Buffer, filename: string): Promise<string> => {
  const bucket = s3Bucket()
  if (bucket) {
    await getS3().send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: filename,
        Body: buffer,
        ContentType: "image/webp",
      })
    )
    return `${MEDIA_PREFIX}${filename}`
  }

  // Local disk when no remote storage is configured (dev, CLI scripts, tests).
  if (process.env.NODE_ENV === "development" || !process.env.BLOB_READ_WRITE_TOKEN) {
    const uploadsDir = join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })
    await writeFile(join(uploadsDir, filename), buffer)
    return `/uploads/${filename}`
  }

  const blob = await put(filename, buffer, {
    access: "public",
    contentType: "image/webp",
  })
  return blob.url
}

export const uploadImage = async (file: File, preset: ImagePreset = "content"): Promise<string> => {
  const validationError = validateFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const buffer = await file.arrayBuffer()
  const compressedBuffer = await compressImage(Buffer.from(buffer), preset)
  return persistImage(compressedBuffer, generateFilename(file.name, preset))
}

// Download a remote image (e.g. Tourinsoft media) and persist it as WebP on our
// own storage, so we no longer depend on the external host's availability.
export const uploadImageFromUrl = async (
  url: string,
  preset: ImagePreset = "content"
): Promise<string> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch image (${response.status}): ${url}`)
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const compressedBuffer = await compressImage(buffer, preset)
  return persistImage(compressedBuffer, generateFilename(url, preset))
}
