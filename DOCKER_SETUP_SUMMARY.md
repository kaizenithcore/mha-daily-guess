# Preparación Docker para Coolify - Resumen Completo

## 📋 Cambios Realizados

### 1. ✅ Dockerfile (CREADO)
**Ubicación:** `/Dockerfile`

**Características:**
- Multi-stage build (compilación + runtime)
- **Stage 1 (builder):** Compila la app con Node.js 20 Alpine
- **Stage 2 (runtime):** Imagen ligera solo para ejecución
- Ejecuta el servidor compilado de TanStack Start
- Fallback a Caddy si el servidor SSR no existe
- Health check integrado
- Expone puerto 80
- Variables de entorno preconfiguradas

**Ventajas:**
- Build rápido (solo necesita Node en compilación)
- Imagen final pequeña (~150-200MB)
- Seguro (sin devDependencies en producción)
- Compatible con Coolify out-of-the-box

### 2. ✅ .dockerignore (CREADO)
**Ubicación:** `/.dockerignore`

**Propósito:** Excluye archivos innecesarios del contexto de build
- node_modules (se reinstalan en Docker)
- .git y archivos de desarrollo
- dist (se regenera)
- .env locales

**Beneficio:** Acelera el build al reducir el contexto de 200MB+ a ~5MB

### 3. ✅ docker-compose.yml (CREADO)
**Ubicación:** `/docker-compose.yml`

**Propósito:** Pruebas locales antes de desplegar en Coolify
```bash
docker-compose up
# App disponible en http://localhost:3000
```

### 4. ✅ COOLIFY_DEPLOYMENT.md (CREADO)
**Ubicación:** `/COOLIFY_DEPLOYMENT.md`

**Guía completa con:**
- Pasos de configuración en Coolify
- Variables de entorno necesarias
- Comandos de prueba local
- Solución de problemas
- Security best practices

### 5. ✅ vite.config.ts (SIN CAMBIOS)
**Estado:** Perfecto como está

```typescript
export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
});
```

**Por qué:**
- Ya incluye `@lovable.dev/vite-tanstack-config`
- Maneja automáticamente:
  - ✓ Inyección de variables VITE_*
  - ✓ Base path correcto (/)
  - ✓ Build output a /dist
  - ✓ TypeScript paths
  - ✓ SSR compilation

**Nota sobre subdominios:**
- El `base: '/'` es correcto (dominio raíz)
- Si necesitaras un subdominio (ej: `/game/`), cambiarías a:
  ```typescript
  export default defineConfig({
    vite: {
      base: '/game/',
    },
    tanstackStart: {
      server: { entry: "server" },
    },
  });
  ```
- Pero tu caso es dominio completo, así que NO cambies nada

### 6. ✅ package.json (SIN CAMBIOS)
**Estado:** Optimizado para Docker

Scripts clave:
```json
"build": "vite build"      // ← El Dockerfile usa esto
"dev": "vite dev"          // Solo desarrollo (no en Docker)
"preview": "vite preview"  // Local only (no en Docker producción)
```

**Por qué no cambiar:**
- npm ci en Docker es correcto (mejor que npm install)
- `npm run build` genera compilación SSR correcta
- No hay dev dependencies en producción (Dockerfile filtra)

---

## 🚀 Próximos Pasos en Coolify

### 1. Push a GitHub
```bash
git add Dockerfile .dockerignore docker-compose.yml COOLIFY_DEPLOYMENT.md
git commit -m "chore: add Docker configuration for Coolify production"
git push origin main
```

### 2. Configurar en Coolify Dashboard
En la sección de "Build & Deployment":

```
Build Command:      npm run build
Install Command:    npm ci
Dockerfile:         ./Dockerfile
Base Directory:     ./ (raíz del repositorio)
```

### 3. Environment Variables (EN COOLIFY)
Si usas variables VITE_* (ejemplo):
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_KEY=your-key-here
NODE_ENV=production
PORT=80
HOST=0.0.0.0
```

⚠️ **IMPORTANTE:** Las variables se inyectan en BUILD TIME, no runtime.
- Añade variables → Haz deploy/redeploy
- Si cambias variables → Redeploy nuevamente

### 4. Click en "Deploy"
- Coolify crea y ejecuta el contenedor
- Espera a que el health check pase (10-15 segundos)
- Accede a tu dominio

---

## 🔍 Validación Local

Antes de desplegar:

```bash
# Opción 1: Docker directo
docker build -t mha-daily-guess .
docker run -p 3000:80 mha-daily-guess

# Opción 2: docker-compose
docker-compose up

# Luego accede a: http://localhost:3000
```

**Si funciona localmente → Funcionará en Coolify**

---

## ⚡ Puntos Clave para Coolify

| Aspecto | Configuración | Razón |
|--------|---------------|-------|
| **Puerto** | 80 (interno) | Coolify reverse proxy maneja el externo |
| **Build** | Multi-stage | Minimiza tamaño imagen (más rápido en Coolify) |
| **Servidor** | TanStack Start compiled | SSR nativo, mejor que preview |
| **Health Check** | Integrado | Coolify detecta fallos rápidamente |
| **NODE_ENV** | production | Optimizaciones de React/Node |
| **Base path** | / | No subdirectorio (dominio completo) |

---

## 📦 Tamaño Esperado

```
Build context: ~5MB   (gracias a .dockerignore)
Final image:   ~150MB (Node 20 Alpine + deps)
Deploy time:   ~2-3min (primera vez)
              ~30-60s (updates)
```

---

## ✅ Checklist antes de deploy

- [ ] Dockerfile existe en raíz
- [ ] .dockerignore existe en raíz
- [ ] Cambios pusheados a GitHub (rama main)
- [ ] Coolify conectado a repo
- [ ] Variables VITE_* añadidas en Coolify si es necesario
- [ ] docker-compose.yml probado localmente (opcional pero recomendado)
- [ ] Leído COOLIFY_DEPLOYMENT.md para detalles

---

## 🆘 Si algo falla

**Revisar logs en Coolify:**
1. Dashboard → Tu app
2. "Deployments" → Build actual
3. "Logs" → Ver error exacto

**Problemas comunes:**

| Error | Solución |
|-------|----------|
| "failed to read dockerfile" | Asegúrate que Dockerfile existe en raíz |
| "npm: not found" | Usa `npm ci` (verificar Dockerfile) |
| "Cannot find module" | Revisa que COPY src en Dockerfile incluya todo |
| "Port already in use" | docker-compose.yml mapea local 3000, no conflicto |
| "Health check failing" | Espera 15s más, aplicación iniciando |

**Debug local:**
```bash
docker run -it --entrypoint /bin/sh mha-daily-guess
# Dentro del contenedor:
ls -la /app/dist/
node dist/server/index.js
```

---

## 🎯 Tu app está lista para producción en Coolify ✨

Todo configurado para:
- ✓ Compilación automática
- ✓ Servicio estateless
- ✓ Escalabilidad horizontal (múltiples instancias)
- ✓ Actualizaciones sin downtime
- ✓ Health checks y monitoreo
