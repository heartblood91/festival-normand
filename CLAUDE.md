# Pierres en Lumières — Festival du Patrimoine Normand

## Override: Autonomous Mode

This project uses Ralph (autonomous AI coding loop). When running as Ralph (`claude -p --dangerously-skip-permissions`):

- You ARE authorized to commit directly without user review
- You ARE authorized to update prd.json, progress.txt, and any project files
- You MUST NOT ask questions — there is no human in the loop
- You MUST NOT wait for approval — commit immediately after tests pass
- You MUST NOT say "Tu veux que je..." or "Want me to..." — just do it

## Stack

- Next.js 16 (App Router, Turbopack)
- Tailwind CSS v4 + shadcn/ui v4 (base-nova)
- Prisma 7 + PostgreSQL (local Docker, port 5433)
- TypeScript strict mode
- Vitest (unit) + Playwright (E2E)

## Code Standards

- ES6 arrow functions only — no `function` keyword
- All imports at file top level — no inline imports
- Comments in English only, only when logic is not self-evident
- Mobile-first CSS (base = mobile, md: = tablet, lg: = desktop)
- RGAA accessibility: skip-nav, semantic HTML, alt texts, focus visible, 44px touch targets

## Design System

- Dark navy: #0f172a to #1e1b4b
- Amber/gold accents: #f59e0b to #d97706
- Glassmorphism: bg-white/5 backdrop-blur-xl border-white/10
- Headings: Playfair Display (serif)
- Body: Inter (sans-serif)

## Quality Gates

- `pnpm tsc --noEmit` — zero errors
- `pnpm test` — all unit tests pass
- `pnpm test:e2e` — all E2E tests pass
- No console.log in production code

## Database

- Local: postgresql://postgres:postgres@localhost:5433/pierres_en_lumieres
- Seed: `pnpm db:seed`
- Migrations: `pnpm prisma migrate dev`

## Deployments

- Production tracks the `main` branch. Staging tracks the `staging` branch.
- **Staging URL: use the native Vercel branch URL**
  `https://pierres-en-lumieres-git-staging-<team>.vercel.app` — it auto-updates
  on every push to `staging`.
- Do NOT rely on `pel-staging.vercel.app`: it is a manual alias that does NOT
  follow the branch, so it silently serves a stale deploy until someone runs
  `vercel alias set` by hand. Treat it as deprecated. (If a stable staging
  domain is wanted, attach a custom domain to the `staging` branch in the
  Vercel project settings instead of a manual alias.)

## Security

- All admin server actions (`lib/actions/{events,news,partners,pages,edition,department-settings,
ai-publish,translate,registration-links,recovery,text-correction,surveys,gallery,reviews}.ts`) call `requireRole("EDITOR")`
  first — `"use server"` exposes them as public HTTP endpoints, so the guard is
  the real authorization boundary (middleware only protects page navigation).
  `lib/actions/users.ts` requires `ADMIN`. Keep this invariant when adding new
  admin actions.
- `lib/actions/survey-submit.ts` is intentionally public (anonymous visitor answers):
  honeypot, published-only, in-memory rate limit. `app/api/admin/surveys/[id]/export`
  checks `getAuthenticatedUser()` itself because middleware skips `/api`.
- `lib/actions/review-submit.ts` is public too (visitor reviews): honeypot, rate limit,
  only for public events that have started; reviews are stored PENDING and only an
  editor can publish them. The AI advice helper lives in `lib/reviews/advise.ts`, not
  in a `"use server"` file, so it cannot be called over HTTP.
- `app/api/upload` checks `getAuthenticatedUser()` and returns 401 for anonymous
  callers before touching storage.

## Ralph

- PRD: `.claude/ralph/tasks/01-full-site-rebuild/prd.json`
- Progress: `.claude/ralph/tasks/01-full-site-rebuild/progress.txt`
- Run: `.claude/ralph/ralph.sh -f 01-full-site-rebuild`
