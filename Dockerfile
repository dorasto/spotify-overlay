FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN npm install -g pnpm
RUN pnpm install --no-frozen-lockfile;


# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Add these environment settings here
ENV NEXT_PUBLIC_ROOT_DOMAIN=NEXT_PUBLIC_ROOT_DOMAIN
ENV ROOT_DOMAIN=ROOT_DOMAIN
ENV SPOTIFY_CLIENT_SECRET=SPOTIFY_CLIENT_SECRET
ENV SPOTIFY_CLIENT_ID=SPOTIFY_CLIENT_ID
ENV NEXT_TELEMETRY_DISABLED=1

# Increase Node memory allocation to 8GB for larger builds
RUN npm install -g pnpm
RUN pnpm run build



# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_PUBLIC_ROOT_DOMAIN=NEXT_PUBLIC_ROOT_DOMAIN
ENV ROOT_DOMAIN=ROOT_DOMAIN
ENV SPOTIFY_CLIENT_SECRET=SPOTIFY_CLIENT_SECRET
ENV SPOTIFY_CLIENT_ID=SPOTIFY_CLIENT_ID

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE $PORT

ENV PORT 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD HOSTNAME="0.0.0.0" node server.js
