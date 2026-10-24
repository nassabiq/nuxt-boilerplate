# Stage 1: Build application with Bun
FROM oven/bun:1-slim AS builder

WORKDIR /app

# Copy dependency specifications
COPY package.json bun.lock ./

# Install dependencies using frozen lockfile
RUN bun install --frozen-lockfile

# Copy application source
COPY . .

# Build Nuxt production output
RUN bun run build

# Stage 2: Production runtime with Node.js
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Copy precompiled Nitro output from builder stage
COPY --from=builder /app/.output ./.output

EXPOSE 3000

# Start server
CMD ["node", ".output/server/index.mjs"]
