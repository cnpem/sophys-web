FROM node:22-alpine AS base
RUN corepack enable
RUN apk add --no-cache libc6-compat curl
RUN npm install -g turbo

FROM base AS builder

# Set "shared" environment variables
ARG NODE_ENV
ARG PORT
ARG COOLIFY_URL

# Set qua-ui environment variables
ARG NEXT_PUBLIC_BASE_PATH

# Set environment variables used in internal packages
ARG AUTH_SECRET 
ARG BLUESKY_HTTPSERVER_URL

WORKDIR /app
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
ENV SKIP_ENV_VALIDATION 1
RUN pnpm install --frozen-lockfile
RUN pnpm build --filter=@sophys-web/qua-ui

FROM builder AS production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

COPY --from=builder --chown=nextjs:nodejs /app /app
WORKDIR /app

CMD ["pnpm", "start", "--filter=@sophys-web/qua-ui"]