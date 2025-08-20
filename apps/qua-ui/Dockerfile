FROM node:20-slim AS base
# ENV PNPM_HOME="/pnpm"
# ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS builder
# Set working directory
WORKDIR /app
# Prune stage for generating a partial monorepo for a target workspace
# RUN pnpm add turbo --global
RUN npm install -g turbo

COPY . .
# Generate a partial monorepo with a pruned lockfile for a target workspace.
RUN turbo prune @sophys-web/qua-ui --docker

# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
WORKDIR /app

ARG AUTH_SECRET
ARG BLUESKY_HTTPSERVER_URL

# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile
 
# Build the project
COPY --from=builder /app/out/full/ .
ENV SKIP_ENV_VALIDATION 1
RUN pnpm run build --filter=@sophys-web/qua-ui

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
 
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