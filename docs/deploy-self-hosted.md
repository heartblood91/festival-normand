# Self-hosted deployment (my-dev-box / Dokploy)

Production runs the `runner` stage of the `Dockerfile` (Next.js standalone),
not Vercel. Anything Vercel used to do for us — running migrations through the
build, calling `/api/cron/sync-tourinsoft` daily from `vercel.json` — has to be
done explicitly here. Nothing in this document has been applied to prod from
the development VPS: every step below is for whoever holds the Dokploy access.

## 1. Database migrations

The `builder` stage runs `prisma migrate deploy` against the `DATABASE_URL`
build secret before `next build`, so a Dokploy deploy of `main` migrates the
database first. Migrations are additive; if one fails, the build fails and the
running image stays up. To migrate by hand without building the app, run the
`migrate` stage:

```sh
docker build --target migrate -t pel-migrate .
docker run --rm -e DATABASE_URL="$DATABASE_URL" pel-migrate
```

### First run on a database created with `db push`

If prod was created with `prisma db push`, `_prisma_migrations` does not exist
and `migrate deploy` stops on `P3005` (schema not empty). Baseline the
migrations that the database already contains, then deploy the rest. First
look at what is actually missing (read-only, prints SQL without running it):

```sh
pnpm prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --script
```

If only Tourinsoft/photos/registration links/`sync_runs` statements show up,
the six migrations up to April are already in the database:

```sh
# Tables events/news/partners/pages/users… already exist → mark the initial ones applied.
for m in $(ls prisma/migrations | grep -E '^2026(0[1-4])'); do
  pnpm prisma migrate resolve --applied "$m"
done
pnpm prisma migrate deploy
```

`20260501000000_add_tourinsoft_photos_registration_links` is idempotent
(`IF NOT EXISTS` everywhere), so it is safe whether or not those columns were
pushed by hand. Check the result with:

```sh
pnpm prisma migrate status
```

Symptom when this step is skipped: every `/fr/evenement/*` page returns 500
(`P2022` — column `events.tourinsoft_id` / table `photos` missing) while the
listing still works.

## 2. Environment variables

| Variable                                                                            | Purpose                                                                                              |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                      | PostgreSQL                                                                                           |
| `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`                                             | admin auth                                                                                           |
| `NEXT_PUBLIC_SITE_URL`                                                              | canonical URLs, sitemap                                                                              |
| `TOURINSOFT_SYNDICATION_URL`                                                        | Tourinsoft V3 feed                                                                                   |
| `TOURINSOFT_SYNC_INTERVAL_MINUTES`                                                  | enables the in-app scheduler (e.g. `360`; minimum 15). Unset = disabled                              |
| `CRON_SECRET`                                                                       | bearer for `/api/cron/sync-tourinsoft` (manual or external trigger)                                  |
| `OPENROUTER_API_KEY`                                                                | EN translation of imported offers, admin AI helpers. Missing = EN left empty, `/en` falls back to FR |
| `OPENROUTER_MODEL`                                                                  | optional, default `google/gemini-3.5-flash-lite`                                                     |
| `S3_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | uploads to an S3-compatible bucket (see §5); takes precedence over Blob                              |
| `BLOB_READ_WRITE_TOKEN`                                                             | Vercel Blob for uploads; with neither S3 nor Blob = local disk `public/uploads` (persistent volume)  |
| `REVALIDATE_TOKEN`                                                                  | `/api/revalidate`                                                                                    |
| `REDIS_URL`                                                                         | optional, shares public-form rate limits across instances and restarts (see §6)                      |
| `TURNSTILE_SECRET_KEY`                                                              | optional, Cloudflare Turnstile server check (see §6)                                                 |

`/api/healthz` lists which of these are set (never their values). It answers
`503` unless one of S3 or Blob is configured, along with the auth, cron and
Tourinsoft variables.

### Build arguments

`NEXT_PUBLIC_*` values are inlined by `next build`, so they are Docker build
arguments, not runtime variables. Changing one means rebuilding the image.

| Build argument                      | Purpose                                                            |
| ----------------------------------- | ------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`              | canonical URLs                                                     |
| `NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN` | audience tracking; empty = no cookie banner and nothing tracked    |
| `NEXT_PUBLIC_POSTHOG_HOST`          | PostHog ingestion host, default `https://eu.i.posthog.com`         |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY`    | anti-spam widget on public forms; needs `TURNSTILE_SECRET_KEY` too |

## 3. Tourinsoft synchronisation

Pick **one** of the following. They can coexist safely: each run is recorded
in `sync_runs`, and a run refuses to start while another one is `RUNNING`
(stale after 30 min).

**A. In-app scheduler (recommended, no extra infrastructure).** Set
`TOURINSOFT_SYNC_INTERVAL_MINUTES=360`. `instrumentation.ts` starts a timer in
the Node server; every 5 minutes it checks the last run in the database and
starts a sync when the interval has elapsed. First check 60 s after boot.

**B. Dokploy schedule / host cron.** Daily, mirrors the old `vercel.json`:

```sh
7 4 * * *  curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
  https://pierres-en-lumieres.my-dev-box.ovh/api/cron/sync-tourinsoft
```

Response codes: `200` success/partial, `409` another run in progress, `502`
feed failure, `401` wrong secret.

### Monitoring

`GET /api/healthz/tourinsoft` (public, no secrets) returns the last run
(status, trigger, timestamps, counts), the scheduler interval and whether AI
translation is configured. It answers `503` when there was never a run, the
last run failed, or the last finished run is older than 36 h — suitable for an
uptime probe. The admin dashboard shows the same information.

## 4. Recovery runbook — sites missing in prod

Evidence: `docs/reports/tourinsoft-prod-diagnostic.md`, regenerated with the
read-only script

```sh
pnpm tsx scripts/diagnose-tourinsoft-prod.ts            # feed vs public site
```

Two separate causes were found:

1. **Feed offers never imported** (no cron since the move off Vercel). Fixed by
   running the sync once after steps 1–3:

   ```sh
   curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
     https://pierres-en-lumieres.my-dev-box.ovh/api/cron/sync-tourinsoft
   ```

   or, from a checkout with prod `DATABASE_URL` in the environment:

   ```sh
   pnpm tsx scripts/sync-tourinsoft.ts
   ```

   The import is idempotent (matched on `tourinsoft_id`, unchanged offers are
   skipped), never deletes and never unpublishes. Re-run the diagnostic: the
   _missing_ column must be empty.

2. **Published events unreachable from `/fr/evenements`**: the listing was
   ordered only by `dateStart`, so OFFSET pages overlapped (409 cards, 302
   distinct events in prod on 2026-11-07). No data is lost; deploying this
   branch (ordering tie-breaker on `id`) makes them all reachable again. The
   diagnostic's "cards seen" and "distinct" counts must then be equal.

3. **v1 events that never reached the new site.** The 2026 edition was
   published on v1 (pierresenlumieres.fr, Directus) but part of it never made
   it to the new site — mostly Seine-Maritime (`FMANOR076…` offers). Compare
   (read-only, v1 public API + new site map view):

   ```sh
   pnpm tsx scripts/compare-v1-prod.ts --year 2026   # → docs/reports/v1-vs-prod.md
   ```

   Then recover them from a checkout with prod `DATABASE_URL` in `.env`,
   always starting with a dry run:

   ```sh
   pnpm tsx scripts/import-directus.ts --year 2026 --dry-run   # lists what would be created
   pnpm tsx scripts/import-directus.ts --year 2026             # drafts, photos copied to our storage
   ```

   Events are created **as drafts** (editors review and publish them in the
   admin; add `--publish` to publish directly). Existing events are matched by
   Tourinsoft id first, then by title + commune, title slug, and place
   (`lib/directus/match.ts`, same edition only); nothing is updated,
   unpublished or deleted, and a second run creates nothing. The Tourinsoft sync
   recognises recovered events by the same id. Options: `--limit N`,
   `--skip-images`, `--no-translate` (otherwise EN is translated when
   `OPENROUTER_API_KEY` is set). Photos go to Vercel Blob when
   `BLOB_READ_WRITE_TOKEN` is set, else to `public/uploads` (persistent volume
   needed).

### Verified locally

On the local database (`pel-audit-db`):

- `scripts/sync-tourinsoft.ts`: first run → `created: 4` (published, photos
  downloaded); second run → `skipped: 4`.
- `scripts/import-directus.ts --year 2026`: dry run → `planned: 423`;
  `--limit 5` → `created: 5` drafts with photos and coordinates; full run with
  `--skip-images` → `knownById: 5, created: 418`; re-run → `knownById: 423,
created: 0`. The test drafts were then removed from the local database.

## 5. Image storage on S3 (Garage)

Uploads (`lib/storage.ts`) are converted to WebP and written to the bucket
under a generated key; the database stores `/media/<key>`, and
`app/media/[key]/route.ts` streams the object back with a one-year immutable
cache. The bucket therefore stays private, and moving to another provider
(OVH Object Storage later) only means copying the objects and changing the
`S3_*` variables: stored URLs do not change.

The provisional bucket is a single-node [Garage](https://garagehq.deuxfleurs.fr)
container. Its configuration and data live outside the repository; create the
bucket and an application key once:

```sh
garage layout assign -z <zone> -c 10G <node-id> && garage layout apply --version 1
garage bucket create pel-media
garage bucket set-quotas pel-media --max-size 10GiB
garage key create pel-app
garage bucket allow --read --write pel-media --key pel-app
```

Then set `S3_ENDPOINT` (the Garage S3 API, port 3900), `S3_REGION` (the
`s3_region` of `garage.toml`, e.g. `garage`), `S3_BUCKET=pel-media` and the
key pair. Never expose the S3 API publicly without TLS; the app is the only
client.

Images uploaded before the switch keep working from wherever they were
(`/uploads/…` or Blob URLs).

## 6. Public forms: Turnstile and rate limits

The contact, review and survey forms accept anonymous visitors. Each one has a
honeypot field and a rate limit; Cloudflare Turnstile is added when both
`NEXT_PUBLIC_TURNSTILE_SITE_KEY` (build argument) and `TURNSTILE_SECRET_KEY`
(runtime) are set. If Cloudflare cannot be reached, the server lets the form
through rather than locking visitors out; the rate limit still applies.

Rate limits are counted in Redis when `REDIS_URL` is set (they then survive
restarts and are shared by every instance), otherwise in memory. A Redis
outage falls back to memory: forms never fail because of it.

The site key only counts as a build argument: `next.config.ts` inlines it in
both the server and the browser bundles, so setting it only at runtime leaves
Turnstile off on both sides rather than asking for a token the page cannot
produce. If the Cloudflare script is blocked in a visitor's browser, the form
can still be sent and the server answers with a message explaining why it was
refused.

Rate limits are keyed on the visitor address: the **last** `X-Forwarded-For`
hop, i.e. the one our reverse proxy (Traefik) appended. This assumes exactly
one proxy in front of the app; if Cloudflare's proxy or a second load balancer
is added in front, every visitor would share that proxy's address, and
`clientKey()` in `lib/rate-limit.ts` must be adapted (e.g. `CF-Connecting-IP`).

The default end-to-end suite runs without Turnstile keys. To exercise them,
build with Cloudflare's always-pass test site key `1x00000000000000000000AA`,
start the server with the test secret `1x0000000000000000000000000000000AA`,
and run `e2e/contact.spec.ts`, `e2e/reviews.spec.ts` and `e2e/surveys.spec.ts`
(specs waiting for `networkidle` never settle while the widget is on the page).
