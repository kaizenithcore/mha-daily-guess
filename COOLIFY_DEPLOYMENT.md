# Guía de despliegue en Coolify

## Estado actual

Este repositorio ya no usa Dockerfile. El despliegue correcto es con **Nixpacks** y el provider **Staticfile** de Nixpacks.

La app sigue construyendo con `npm run build`, pero en producción se sirve el frontend compilado desde `dist/client`.

## Configuración recomendada en Coolify

1. Crea o recrea el recurso usando **Build Pack: Nixpacks**.
2. No uses Dockerfile.
3. No actives ninguna configuración manual de Caddy o Nginx.
4. Mantén el puerto interno por defecto de Nixpacks/NGINX en `80`.
5. Si Coolify te muestra una opción de sitio estático, úsala solo si no entra en conflicto con Nixpacks.

## Qué hace este repo

- `package.json` compila con `vite build`.
- `Staticfile` fija la raíz servida en `dist/client`.
- Nixpacks detecta `package.json` para construir y `Staticfile` para servir.

## Variables de entorno

Las variables `VITE_*` deben seguir configurándose en Coolify antes del deploy para que queden embebidas en build time.

## Validación local

Antes de redeployar, el proyecto debe seguir compilando con:

```bash
npm run build
```

Si el recurso actual sigue en bucle de reinicios, crea un recurso nuevo en Coolify con Nixpacks y elimina el anterior para que no arrastre la configuración vieja.
