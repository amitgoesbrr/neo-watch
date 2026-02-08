# Neo-Watch Backend Dockerfile
# Multi-stage build for optimal production image

# {{{ Base Stage
FROM oven/bun:1-alpine AS base
WORKDIR /app
ENV NODE_ENV=production
# }}}

# {{{ Dependencies Stage
FROM base AS deps
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile --production
# }}}

# {{{ Builder Stage
FROM base AS builder
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .
# If you have a build step, add it here
# RUN bun run build
# }}}

# {{{ Runner Stage
FROM base AS runner
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 elysiajs

# Copy necessary files from builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package.json ./
COPY --from=builder /app/drizzle.config.ts ./

# Set ownership
RUN chown -R elysiajs:nodejs /app

USER elysiajs

EXPOSE 4000
ENV PORT=4000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:4000/health || exit 1

CMD ["bun", "run", "src/index.ts"]
# }}}
