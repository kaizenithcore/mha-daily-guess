# Guía de despliegue en Coolify

## Estado actual

Este repositorio ya no usa Dockerfile. El despliegue correcto es con **Nixpacks** y un adaptador Node que expone el worker generado por TanStack Start.

La app compila con `npm run build` y el runtime arranca `scripts/serve-worker.mjs`, que traduce requests HTTP de Coolify al `fetch` del worker en `dist/server/index.js`.

## Configuración recomendada en Coolify

1. Usa **Build Pack: Nixpacks**.
2. Deja **Is it a static site? = No** y **Is it a SPA? = No**.
3. Deja **Publish Directory** vacío.
4. No uses configuración custom de Nginx/Caddy en Coolify.
5. En Domains, pon solo hostnames (sin protocolo ni slash final): `mhadle.kaizenith.es`.
6. Si quieres varios dominios, añádelos como entradas separadas en la UI.
7. El runtime escucha de forma fija en `3000`.

## Qué hace este repo

- `package.json` compila con `vite build`.
- `package.json` expone `start` como adaptador Node para el worker generado.
- `nixpacks.toml` deja explícito el directorio cliente para Nixpacks.

## Variables de entorno

Ninguna. Desde 2026-10 la app no tiene backend: los personajes están en `src/data/characters.json` y sus retratos en `src/assets/characters/<id>.webp`, empaquetados en el build. Las antiguas variables `VITE_SUPABASE_*` / `SUPABASE_*` pueden borrarse de Coolify.

## Validación local

Antes de redeployar, el proyecto debe seguir compilando con:

```bash
npm run build
```

Si el recurso actual sigue en bucle de reinicios, crea un recurso nuevo en Coolify con Nixpacks y elimina el anterior para que no arrastre la configuración vieja.

## Diagnóstico rápido de 404 en este setup

Si aparece 404 después de compilar bien:

1. Revisa que en logs de plan aparezca `node scripts/serve-worker.mjs` como start command.
2. Revisa que `COOLIFY_FQDN` no tenga valores corruptos como `https`.
3. Revisa que el puerto interno del contenedor coincida con `3000` y con el puerto expuesto en Coolify.
4. Haz redeploy con cache limpio.
