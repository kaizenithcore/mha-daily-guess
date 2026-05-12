# Multi-stage build para TanStack Start
# Stage 1: Build y compilación
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de configuración y definición
COPY package*.json ./
COPY tsconfig.json ./
COPY tsconfig.scripts.json ./
COPY vite.config.ts ./
COPY wrangler.jsonc ./
COPY components.json ./
COPY eslint.config.js ./

# Instalar todas las dependencias (incluidas devDependencies para build)
RUN npm ci

# Copiar código fuente y archivos necesarios
COPY src ./src
COPY scripts ./scripts
COPY dist-scripts ./dist-scripts
COPY .tanstack ./.tanstack
COPY supabase ./supabase
COPY public ./public 2>/dev/null || true

# Compilar la aplicación (genera dist/client y dist/server)
RUN npm run build

# Stage 2: Runtime - producción
FROM node:20-alpine

WORKDIR /app

# Configurar variables de entorno
ENV NODE_ENV=production \
    PORT=80 \
    HOST=0.0.0.0

# Instalar dumb-init para manejo correcto de señales
RUN apk add --no-cache dumb-init

# Copiar archivos compilados del builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Crear script de inicio que maneja tanto SSR como fallback estático
RUN mkdir -p /app/bin && echo '#!/bin/sh\n\
if [ -f "/app/dist/server/index.js" ]; then\n\
  echo "Iniciando servidor TanStack Start..."\n\
  exec node /app/dist/server/index.js\n\
else\n\
  echo "Servidor compilado no encontrado, sirviendo estáticos con Caddy..."\n\
  apk add --no-cache caddy\n\
  exec caddy run --config /etc/caddy/Caddyfile\n\
fi' > /app/bin/start.sh && chmod +x /app/bin/start.sh

# Configurar Caddy como fallback
RUN mkdir -p /etc/caddy && echo ":80 {\n  root /app/dist/client\n  file_server\n  try_files {path} {path}/ /index.html\n}\n" > /etc/caddy/Caddyfile

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
    CMD node -e "require('http').get('http://localhost:80', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Exponer puerto
EXPOSE 80

# Usar dumb-init para iniciar la app
ENTRYPOINT ["/usr/sbin/dumb-init", "--"]
CMD ["/app/bin/start.sh"]
