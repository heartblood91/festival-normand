# Feature: Pierres en Lumieres — Full Site Rebuild

## Vision

Rebuild the "Pierres en Lumieres" festival website from scratch using Next.js 15, replacing the current Nuxt.js + Directus stack. The new site must be fast, beautiful (glassmorphism nocturnal theme), accessible (RGAA), and maintainable with a lightweight homemade CMS admin.

## Problem

The current site (pierresenlumieres.fr) runs on Nuxt.js + Directus on an OVH VPS. The original developer passed away, there have been budget issues, and the site is incomplete (missing dates display, poor SEO, accessibility issues). The organization needs a modern, maintainable, free-to-host solution.

## Solution

Full rebuild with:
- **Frontend**: Next.js 15 (App Router, Turbopack), Tailwind CSS v4, shadcn/ui
- **Backend**: Next.js API routes + Server Actions
- **Database**: PostgreSQL via Neon (free tier)
- **ORM**: Prisma
- **Search**: PostgreSQL full-text search (tsvector)
- **Maps**: Mapbox GL JS (free tier < 50k loads/month)
- **Emails**: Resend (contact form)
- **Auth**: Better Auth (admin magic link)
- **Hosting**: Vercel (free tier, ISR)
- **Analytics**: Vercel Analytics
- **Repo**: GitHub

## Design Direction

- **Theme**: Glassmorphism nocturnal — dark navy (#0f172a to #1e1b4b) with amber/gold accents (#f59e0b)
- **Glass cards**: bg-white/5 backdrop-blur-xl border-white/10 with hover glow
- **Typography**: Serif titles (Playfair Display or Cormorant Garamond) + Inter/Geist body
- **Photos**: Nocturnal ambiance, slight overlay for cohesion
- **Animations**: Subtle fade-in on scroll, light parallax on hero

## Pages

1. **Home** — Hero with video background, search bar + filter, featured news carousel, featured events (3 cards), partners footer
2. **Events list** — Paginated grid (12/page), search by location (autocomplete), filters (date/category/department/accessibility), responsive cards
3. **Event detail** — Title, location, date+time, rich description, pricing, organizer, photo carousel, Mapbox map, contact email
4. **News list** — Card grid with image + date
5. **News detail** — Rich content (headings, paragraphs, images, YouTube embeds, links)
6. **Festival** — Long editorial page, per-department sections (5), images, contact emails, photo carousel
7. **Contact** — Form with name, email, department selector (5 options), message textarea + Resend integration
8. **Registration** — Informational page with external links, YouTube embed, department logos linking to their registration forms
9. **Legal** — Static text content page
10. **Admin** — Protected CRUD for events, news, partners, static pages + Markdown editor (Tiptap)

## Data Model

### Event
- id, title, slug, description (text), location (city name), department (enum: Calvados, Eure, Manche, Orne, Seine-Maritime)
- category (enum: Illuminations, Expositions, Animations et spectacles vivants, Visites)
- dates (array of dates from the 3 festival days), startTime, endTime
- pricing (text), organizer (text), contactEmail
- latitude, longitude (for map)
- images (array of URLs), featured (boolean)
- accessibilityPMR (boolean)
- createdAt, updatedAt

### News (Actualite)
- id, title, slug, content (markdown), excerpt, coverImage
- publishedAt, createdAt, updatedAt

### Partner
- id, name, logoUrl, websiteUrl, order
- createdAt, updatedAt

### Page (for static content like Festival, Registration, Legal)
- id, slug, title, content (markdown)
- createdAt, updatedAt

### Admin User
- id, email
- createdAt

## Cache Strategy

- Events list + detail: ISR revalidate 3600 (1h)
- Home: ISR revalidate 3600
- Static pages: ISR revalidate 86400 (24h)
- On-demand revalidation via revalidatePath() when admin updates content

## Technical Notes

- No Redis needed for this scale (~60 events)
- No Algolia needed — PostgreSQL full-text is sufficient for commune search + filters
- Mapbox free tier: keep under 50k map loads/month (ISR caching helps)
- All admin routes protected by Better Auth
- Markdown editor: Tiptap for rich content editing in admin
- Images: Vercel Image Optimization or upload to Vercel Blob
- SEO: proper meta tags, OG images, sitemap.xml, robots.txt
- Accessibility: RGAA compliant (skip-nav, proper alt texts, focus management, semantic HTML)
