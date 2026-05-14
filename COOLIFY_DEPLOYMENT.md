# Guía de despliegue en Coolify

## Estado actual

Este repositorio ya no usa Dockerfile. El despliegue correcto es con **Nixpacks**.

La app compila con `npm run build` y en producción se sirve el frontend desde `dist/client`.
Para evitar defaults ambiguos de Coolify, este repo incluye `nixpacks.toml` con `NIXPACKS_SPA_OUTPUT_DIR=dist/client`.

## Configuración recomendada en Coolify

1. Usa **Build Pack: Nixpacks**.
2. Deja **Is it a static site? = No** y **Is it a SPA? = No** para evitar que Coolify genere un contenedor nginx adicional.
3. Deja **Publish Directory** vacío.
4. No uses configuración custom de Nginx/Caddy en Coolify.
5. En Domains, pon solo hostnames (sin protocolo): `mhadle.kaizenith.es`.
6. Si quieres varios dominios, añádelos como entradas separadas en la UI (evita mezclarlos en una sola cadena con protocolos).
7. El runtime debe escuchar en puerto interno `80` (forzado en `nixpacks.toml` con `PORT=80`).

## Qué hace este repo

- `package.json` compila con `vite build`.
- `nixpacks.toml` fija `NIXPACKS_SPA_OUTPUT_DIR` en `dist/client`.
- `Staticfile` se conserva como referencia, pero la configuración efectiva queda forzada por Nixpacks.

## Variables de entorno

Las variables `VITE_*` deben seguir configurándose en Coolify antes del deploy para que queden embebidas en build time.

No definas secretos de servidor en frontend. `SUPABASE_SERVICE_ROLE_KEY` no debe inyectarse en builds cliente.

## Validación local

Antes de redeployar, el proyecto debe seguir compilando con:

```bash
npm run build
```

Si el recurso actual sigue en bucle de reinicios, crea un recurso nuevo en Coolify con Nixpacks y elimina el anterior para que no arrastre la configuración vieja.

## Diagnóstico rápido de 404 en este setup

Si aparece 404 después de compilar bien:

1. Revisa que en logs de plan aparezca `NIXPACKS_SPA_OUTPUT_DIR: dist/client`.
2. Revisa que `COOLIFY_FQDN` no tenga valores corruptos como `https`.
3. Revisa que `PORT=80` esté presente en el entorno final del contenedor.
4. Haz redeploy con cache limpio.
