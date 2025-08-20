FROM node:20.11.1-alpine AS base
 
FROM base AS builder
RUN apk add --no-cache libc6-compat
RUN apk update
# Set working directory
WORKDIR /app
RUN yarn global add turbo
COPY . .
RUN turbo prune @sophys-web/qua-ui  --docker
 
# Add lockfile and package.json's of isolated subworkspace
FROM base AS installer
RUN apk add --no-cache libc6-compat
RUN apk update
WORKDIR /app
 
# First install the dependencies (as they change less often)
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN corepack enable
RUN pnpm install --frozen-lockfile
 
# Build the project
COPY --from=builder /app/out/full/ .
RUN pnpm run build --filter=@sophys-web/qua-ui
 
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1 
# Don't run production as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
 
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=installer --chown=nextjs:nodejs /app/apps/qua-ui/.next/standalone ./next/standalone
COPY --from=installer --chown=nextjs:nodejs /app/apps/qua-ui/.next/static ./next/standalone/apps/qua-ui/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/qua-ui/public ./next/standalone/apps/qua-ui/public

USER nextjs

EXPOSE 3000
ENV PORT 3000

ENV HOSTNAME "0.0.0.0"
CMD node next/standalone/apps/qua-ui/server.js

