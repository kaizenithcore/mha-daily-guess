# Multi-stage build para TanStack Start
# Stage 1: Build y compilación
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración (solo los que existen en el repo)
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY wrangler.jsonc ./
COPY components.json ./

# Instalar todas las dependencias (incluidas devDependencies para build)
RUN npm ci

# Copiar código fuente
COPY src ./src

# Copiar supabase (migrations y config)
COPY supabase ./supabase

# Compilar la aplicación (genera dist/client y dist/server)
RUN npm run build

# Stage 2: Runtime - producción
FROM node:20-alpine

WORKDIR /app

# Configurar variables de entorno
ENV NODE_ENV=production \
    PORT=80 \
    HOST=0.0.0.0

# Copiar archivos compilados del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Health check
# HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
#     CMD node -e "require('http').get('http://localhost:80', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Exponer puerto
EXPOSE 80

# Ejecutar el servidor compilado de TanStack Start
CMD ["node", "dist/server/index.js"]
