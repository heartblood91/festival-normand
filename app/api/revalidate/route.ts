import { NextRequest, NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"

export const POST = async (request: NextRequest) => {
  const token = request.headers.get("x-revalidate-token")
  if (!token || token !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as { tags?: string[]; paths?: string[] }
  const tags = body.tags ?? []
  const paths = body.paths ?? []

  for (const tag of tags) revalidateTag(tag, "default")
  for (const path of paths) revalidatePath(path, "page")

  return NextResponse.json({ revalidated: true, tags, paths })
}
