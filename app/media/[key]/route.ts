import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3"
import { getS3, MEDIA_KEY_PATTERN, s3Bucket } from "@/lib/s3"

/** Streams an uploaded image from the private S3 bucket. File names are unique, so caches may keep them forever. */
export const GET = async (_request: Request, { params }: { params: Promise<{ key: string }> }) => {
  const { key } = await params
  const bucket = s3Bucket()
  if (!bucket || !MEDIA_KEY_PATTERN.test(key)) return new Response(null, { status: 404 })

  try {
    const object = await getS3().send(new GetObjectCommand({ Bucket: bucket, Key: key }))
    if (!object.Body) return new Response(null, { status: 404 })
    return new Response(object.Body.transformToWebStream(), {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        ...(object.ContentLength ? { "Content-Length": String(object.ContentLength) } : {}),
      },
    })
  } catch (error) {
    if (error instanceof NoSuchKey) return new Response(null, { status: 404 })
    return new Response(null, { status: 502 })
  }
}
