FROM node:18-alpine AS base
RUN corepack enable

# This Dockerfile is copy-pasted into our main docs at /docs/handbook/deploying-with-docker.
# Make sure you update both files!

FROM base AS builder
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
# RUN npm global add turbo
RUN npm install -g turbo
COPY . .
RUN pnpm turbo prune @sophys-web/qua-ui --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

ARG AUTH_SECRET
ARG BLUESKY_HTTPSERVER_URL
ARG COOLIFY_URL

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install

# Build the project
COPY --from=builder /app/out/full/ .

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm turbo build

FROM base AS runner
WORKDIR /app
# Install curl for health checks and other utilities
RUN apk add --no-cache curl
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/qua-ui/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/qua-ui/.next/static ./apps/qua-ui/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/qua-ui/public ./apps/qua-ui/public

CMD node apps/qua-ui/server.js