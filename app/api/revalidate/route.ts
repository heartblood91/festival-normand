import { NextRequest, NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"

// A route pattern ("/[locale]/evenement/[slug]") needs the "page" type; a
// concrete URL ("/fr/evenement/x") must not get it, otherwise the tag becomes
// "/fr/evenement/x/page" and matches no cached page.
const revalidateRoute = (path: string) =>
  path.includes("[") ? revalidatePath(path, "page") : revalidatePath(path)

export const POST = async (request: NextRequest) => {
  const token = request.headers.get("x-revalidate-token")
  if (!token || token !== process.env.REVALIDATE_TOKEN) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }

  const body = (await request.json()) as { tags?: string[]; paths?: string[] }
  const tags = body.tags ?? []
  const paths = body.paths ?? []

  // Expire at once, like an admin save, instead of serving stale content once more.
  for (const tag of tags) revalidateTag(tag, { expire: 0 })
  for (const path of paths) revalidateRoute(path)

  return NextResponse.json({ revalidated: true, tags, paths })
}
