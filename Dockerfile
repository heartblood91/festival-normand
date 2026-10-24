FROM node:24.22.1-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
  && apt-get install --yes --no-install-recommends ca-certificates openssl \
  && corepack enable
WORKDIR /app

FROM base AS dependencies

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

FROM base AS builder

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_MAPBOX_TOKEN
ARG NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED=true
ARG NEXT_PUBLIC_SITE_URL

ENV NEXT_PUBLIC_BASE_URL="$NEXT_PUBLIC_BASE_URL"
ENV NEXT_PUBLIC_MAPBOX_TOKEN="$NEXT_PUBLIC_MAPBOX_TOKEN"
ENV NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED="$NEXT_PUBLIC_PERFORMANCE_MONITORING_ENABLED"
ENV NEXT_PUBLIC_SITE_URL="$NEXT_PUBLIC_SITE_URL"

RUN --mount=type=secret,id=DATABASE_URL,required=true \
  DATABASE_URL="$(cat /run/secrets/DATABASE_URL)" \
  BETTER_AUTH_SECRET="build-only-secret-not-used-at-runtime" \
  BETTER_AUTH_URL="$NEXT_PUBLIC_SITE_URL" \
  RESEND_API_KEY="re_build_only_not_used_at_runtime" \
  pnpm build

FROM base AS runner

ENV HOSTNAME="0.0.0.0"
ENV NODE_ENV="production"
ENV PORT="3000"

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

RUN mkdir --parents /app/data && chown node:node /app/data

USER node

EXPOSE 3000

CMD ["node", "server.js"]
