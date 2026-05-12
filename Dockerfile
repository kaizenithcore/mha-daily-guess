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

ENV NODE_ENV=production

# Instalar Caddy
RUN apk add --no-cache caddy

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Crear Caddyfile mínimo: reverse proxy 80 -> localhost:3000
RUN echo ':80 {' > /etc/caddy/Caddyfile && \
    echo '  reverse_proxy localhost:3000' >> /etc/caddy/Caddyfile && \
    echo '}' >> /etc/caddy/Caddyfile

EXPOSE 80

# Ejecutar: Node en background + Caddy en foreground
CMD ["sh", "-c", "PORT=3000 HOST=0.0.0.0 node dist/server/index.js & sleep 3; caddy run --config /etc/caddy/Caddyfile"]