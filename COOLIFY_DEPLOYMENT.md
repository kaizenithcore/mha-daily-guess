# Guía de Despliegue en Coolify

## Requisitos previos

- Dockerfile presente en el repositorio (✓ creado)
- .dockerignore presente (✓ creado)
- Repository es público en GitHub

## Configuración en Coolify

### 1. Conexión de repositorio
- Conecta tu repositorio GitHub públicamente
- Selecciona la rama `main` o `production`

### 2. Configuración de Build
En Coolify, configura:

```
Build Command: npm run build
Install Command: npm ci
Dockerfile: ./Dockerfile (ruta por defecto)
```

### 3. Variables de Entorno (si es necesario)
Añade en Coolify bajo "Environment Variables":

```
NODE_ENV=production
PORT=80
HOST=0.0.0.0
```

### 4. Puerto
- Puerto interno del contenedor: `80`
- Coolify automáticamente lo mapea a través de su reverse proxy
- NO cambies el puerto en el Dockerfile

### 5. Health Check
El Dockerfile incluye health check automático
- Intervalo: 30s
- Timeout: 3s
- Período de inicio: 10s

## Despliegue

1. Sube los cambios a GitHub:
```bash
git add Dockerfile .dockerignore docker-compose.yml
git commit -m "chore: add Docker configuration for Coolify"
git push origin main
```

2. En Coolify:
   - Click en "Deploy" o "Redeploy"
   - El contenedor se construirá automáticamente
   - Espera a que el health check pase

## Pruebas Locales

Para probar antes de desplegar en Coolify:

```bash
# Build local
docker build -t mha-daily-guess .

# Run local
docker run -p 3000:80 mha-daily-guess

# O usar docker-compose
docker-compose up
```

Luego accede a http://localhost:3000

## Notas Técnicas

### Multi-stage Build
- **Stage 1 (builder)**: Compila la app con Node.js
- **Stage 2 (runtime)**: Solo incluye archivos necesarios para ejecutar

### Servidor
- La app ejecuta el servidor compilado de TanStack Start
- Si el servidor no existe, sirve archivos estáticos con Caddy (fallback)
- TanStack Start escucha en puerto 80 dentro del contenedor

### Variables de Entorno
Las variables `VITE_*` se definen en build time:
- En Coolify, añádelas en "Environment Variables" ANTES de hacer deploy
- El build las inyectará automáticamente

### Reverse Proxy
- Coolify actúa como reverse proxy
- La app se despliega detrás de él
- No necesitas configurar proxy inverso adicional

## Solución de problemas

### Build falla con "node_modules"
- Asegúrate de que .dockerignore existe y tiene node_modules listado

### Contenedor no inicia
- Revisa los logs en Coolify: "Deployment" → "Logs"
- Comando local para debug: `docker run -it --entrypoint /bin/sh mha-daily-guess`

### Puerto no responde
- Verifica que PORT=80 en las variables de entorno
- Coolify mapea automáticamente, no cambies el puerto interno

### Variables de entorno no se inyectan
- Las VITE_* se inyectan en BUILD time, no en runtime
- Redeploy después de cambiar variables de entorno

## Performance Tips

- El Dockerfile usa Alpine (imagen ligera ~20MB)
- Multi-stage reduce el tamaño final de la imagen
- Node 20 LTS es estable y bien soportado

## Security

- La imagen de producción NO incluye devDependencies
- NODE_ENV=production minimiza superficie de ataque
- dumb-init maneja señales correctamente (graceful shutdown)
