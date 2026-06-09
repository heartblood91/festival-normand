import { uploadImage } from "@/lib/storage"
import { IMAGE_PRESETS } from "@/lib/image-config"
import type { ImagePreset } from "@/lib/image-config"
import { getAuthenticatedUser } from "@/lib/rbac"

export const POST = async (request: Request) => {
  try {
    // Only authenticated admin users (EDITOR or ADMIN) may upload to storage.
    // Without this, the endpoint lets anyone push files to the blob bucket.
    const user = await getAuthenticatedUser()
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const preset = (formData.get("preset") as string) || "content"

    if (!file) {
      return Response.json({ error: "No file provided" }, { status: 400 })
    }

    if (!Object.keys(IMAGE_PRESETS).includes(preset)) {
      return Response.json({ error: "Invalid preset" }, { status: 400 })
    }

    const url = await uploadImage(file, preset as ImagePreset)
    return Response.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"

    if (message.includes("too large")) {
      return Response.json({ error: message }, { status: 413 })
    }

    if (message.includes("Invalid file type")) {
      return Response.json({ error: message }, { status: 400 })
    }

    return Response.json({ error: message }, { status: 500 })
  }
}
