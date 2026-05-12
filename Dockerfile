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
FROM caddy:2-alpine

WORKDIR /usr/share/caddy

COPY --from=builder /app/dist ./

RUN printf ':80 {\n  root * /usr/share/caddy\n  encode zstd gzip\n  try_files {path} /index.html\n  file_server\n}\n' > /etc/caddy/Caddyfile

EXPOSE 80

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]