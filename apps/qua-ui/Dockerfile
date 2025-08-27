FROM node:22-alpine AS base
RUN corepack enable
ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN apk add --no-cache libc6-compat
 
FROM base AS builder
RUN apk update
RUN apk add --no-cache libc6-compat
# Set working directory
WORKDIR /app
RUN pnpm add turbo --global
COPY . .
 
# Generate a partial monorepo with a pruned lockfile for a target workspace.
# Assuming "@sophys-web/qua-ui" is the name entered in the project's package.json: { name: "@sophys-web/qua-ui" }
RUN turbo prune @sophys-web/qua-ui --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY --from=builder /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Set qua-ui environment variables
ARG NEXT_PUBLIC_BASE_PATH
ENV NEXT_PUBLIC_BASE_PATH=$NEXT_PUBLIC_BASE_PATH
ARG NEXT_PUBLIC_PVWS_URL
ENV NEXT_PUBLIC_PVWS_URL=$NEXT_PUBLIC_PVWS_URL

# Set environment variables used in internal packages
ARG AUTH_SECRET 
ARG AUTH_TRUST_HOST
ENV AUTH_TRUST_HOST=$AUTH_TRUST_HOST
ARG BLUESKY_HTTPSERVER_URL
 
# Build the project
COPY --from=builder /app/out/full/ .
RUN SKIP_ENV_VALIDATION=1 pnpm turbo run build
 
FROM base AS runner
WORKDIR /app
 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/qua-ui/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/qua-ui/.next/static ./apps/qua-ui/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/qua-ui/public ./apps/qua-ui/public
 
EXPOSE 3000
CMD node apps/qua-ui/server.js