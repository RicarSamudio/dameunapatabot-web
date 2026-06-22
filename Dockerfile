# ---- Build stage ----
FROM node:22-bookworm AS builder

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Build arguments from Coolify
ARG DATABASE_URL
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

# Needed at build time for Prisma generate and next build
ENV DATABASE_URL=${DATABASE_URL}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

# Copy package files first (layer cache)
COPY package.json package-lock.json ./

# Copy prisma schema before install (needed for prisma generate)
COPY prisma ./prisma

# Install ALL dependencies (including devDeps for build)
RUN npm ci && npx prisma generate

# Copy source
COPY . .

# Build Next.js
RUN npm run build

# ---- Production stage ----
FROM node:22-bookworm-slim AS runner

WORKDIR /app

RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

# Copy only what's needed for production
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/prisma ./prisma

# Install production dependencies only and regenerate Prisma client
RUN npm ci --omit=dev && npx prisma generate

# Copy built app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/scripts ./scripts

# Create uploads directory
RUN mkdir -p public/uploads && chmod +x scripts/start-production.sh

EXPOSE 3000

CMD ["./scripts/start-production.sh"]
