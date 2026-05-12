# =========================
# Stage 1: Build
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY wrangler.jsonc ./
COPY components.json ./

RUN npm ci

COPY src ./src
COPY supabase ./supabase

RUN npm run build

# =========================
# Stage 2: Runtime
# =========================
FROM node:20-alpine

WORKDIR /app

# Instalar wget para healthcheck
RUN apk add --no-cache wget

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Healthcheck real
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ || exit 1

CMD ["node", "dist/server/index.js"]