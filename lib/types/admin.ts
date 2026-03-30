export type AdminEventListItem = {
  id: string
  titleFr: string
  slug: string
  city: string
  department: string
  category: string
  dateStart: Date
  featured: boolean
  published: boolean
  publishedAt: Date | null
  unpublishedAt: Date | null
  accessible: boolean
}

export type AdminNewsListItem = {
  id: string
  titleFr: string
  slug: string
  coverImage: string | null
  published: boolean
  excerptFr: string | null
  publishedAt: Date | null
}
