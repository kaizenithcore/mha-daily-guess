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

ENV NODE_ENV=production \
    PORT=80 \
    HOST=0.0.0.0

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 80

CMD ["node", "dist/server/index.js"]